import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Get all tenancies
 */
export const getTenancies = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      page = '1',
      pageSize = '20',
      tenantId,
      unitId,
      isActive,
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    const where: any = {};

    if (tenantId) where.tenantId = tenantId as string;
    if (unitId) where.unitId = unitId as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const total = await prisma.tenancy.count({ where });

    const tenancies = await prisma.tenancy.findMany({
      where,
      skip,
      take: pageSizeNum,
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
      orderBy: { moveInDate: 'desc' },
    });

    return paginatedResponse(res, tenancies, {
      page: pageNum,
      pageSize: pageSizeNum,
      total,
      totalPages: Math.ceil(total / pageSizeNum),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Move-in: Create new tenancy and update statuses
 */
export const moveIn = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      tenantId,
      unitId,
      moveInDate,
      depositPaid,
      depositPaidDate,
      notes,
    } = req.body;

    // Validation
    if (!tenantId || !unitId || !moveInDate) {
      return errorResponse(
        res,
        'Tenant, unit, and move-in date are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (depositPaid !== undefined && (isNaN(depositPaid) || depositPaid < 0)) {
      return errorResponse(
        res,
        'Deposit paid must be 0 or greater.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check if tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        tenancies: {
          where: { isActive: true },
        },
      },
    });

    if (!tenant) {
      return errorResponse(
        res,
        'Tenant not found.',
        'NOT_FOUND',
        404
      );
    }

    // Check if tenant already has an active tenancy
    if (tenant.tenancies.length > 0) {
      return errorResponse(
        res,
        'This tenant already has an active tenancy. Please move them out first.',
        'TENANT_ALREADY_ASSIGNED',
        409
      );
    }

    // Check if unit exists and is vacant
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        tenancies: {
          where: { isActive: true },
        },
      },
    });

    if (!unit) {
      return errorResponse(
        res,
        'Unit not found.',
        'NOT_FOUND',
        404
      );
    }

    if (unit.status !== 'VACANT' && unit.status !== 'RESERVED') {
      return errorResponse(
        res,
        'This unit is not available. Only vacant or reserved units can be assigned.',
        'UNIT_NOT_AVAILABLE',
        409
      );
    }

    // Check if unit already has an active tenancy
    if (unit.tenancies.length > 0) {
      return errorResponse(
        res,
        'This unit already has an active tenant.',
        'UNIT_ALREADY_OCCUPIED',
        409
      );
    }

    // Create tenancy and update statuses in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenancy
      const tenancy = await tx.tenancy.create({
        data: {
          tenantId,
          unitId,
          moveInDate: new Date(moveInDate),
          depositPaid: depositPaid || 0,
          depositPaidDate: depositPaidDate ? new Date(depositPaidDate) : null,
          depositStatus: 'HELD',
          isActive: true,
          notes,
        },
        include: {
          tenant: true,
          unit: {
            include: {
              property: true,
            },
          },
        },
      });

      // Update unit status to OCCUPIED
      await tx.unit.update({
        where: { id: unitId },
        data: { status: 'OCCUPIED' },
      });

      // Update tenant status to ACTIVE
      await tx.tenant.update({
        where: { id: tenantId },
        data: { status: 'ACTIVE' },
      });

      // Create opening balance invoice if tenant has opening balance
      if (tenant.openingBalance && Number(tenant.openingBalance) > 0) {
        const openingBalance = Number(tenant.openingBalance);
        const today = new Date();
        // Set due date to 30 days ago to make it overdue
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() - 30);
        
        // Get previous month for period (YYYY-MM format)
        const prevMonth = new Date(today);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        const period = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

        await tx.invoice.create({
          data: {
            tenancyId: tenancy.id,
            tenantId: tenant.id,
            unitId: unit.id,
            period: `OPENING-${period}`, // Special period format for opening balance
            dueDate: dueDate,
            rentAmount: openingBalance,
            additionalCharges: 0,
            totalAmount: openingBalance,
            paidAmount: 0,
            status: 'OVERDUE',
            notes: `Opening balance from previous system migration - ${openingBalance} KES`,
          },
        });

        logger.info('Opening balance invoice created', {
          tenantId: tenant.id,
          tenancyId: tenancy.id,
          amount: openingBalance,
        });
      }

      return tenancy;
    });

    logger.info('Tenant moved in', {
      tenancyId: result.id,
      tenantId,
      unitId,
      tenantName: `${tenant.firstName} ${tenant.lastName}`,
    });

    return successResponse(
      res,
      result,
      'Tenant moved in successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Move-out: End tenancy and update statuses
 */
export const moveOut = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      moveOutDate,
      depositRefunded,
      depositRefundDate,
      depositStatus,
      notes,
    } = req.body;

    // Validation
    if (!moveOutDate) {
      return errorResponse(
        res,
        'Move-out date is required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Get tenancy
    const tenancy = await prisma.tenancy.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: true,
      },
    });

    if (!tenancy) {
      return errorResponse(
        res,
        'Tenancy not found.',
        'NOT_FOUND',
        404
      );
    }

    if (!tenancy.isActive) {
      return errorResponse(
        res,
        'This tenancy is already ended.',
        'TENANCY_INACTIVE',
        400
      );
    }

    // Validate move-out date is after move-in date
    const moveOut = new Date(moveOutDate);
    if (moveOut < tenancy.moveInDate) {
      return errorResponse(
        res,
        'Move-out date must be after move-in date.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate deposit refund amount
    if (depositRefunded !== undefined) {
      const refund = parseFloat(depositRefunded);
      if (isNaN(refund) || refund < 0) {
        return errorResponse(
          res,
          'Deposit refund amount must be 0 or greater.',
          'VALIDATION_ERROR',
          400
        );
      }
      if (refund > Number(tenancy.depositPaid)) {
        return errorResponse(
          res,
          'Deposit refund cannot exceed deposit paid.',
          'VALIDATION_ERROR',
          400
        );
      }
    }

    // Update tenancy and statuses in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update tenancy
      const updatedTenancy = await tx.tenancy.update({
        where: { id },
        data: {
          moveOutDate: moveOut,
          depositRefunded: depositRefunded || 0,
          depositRefundDate: depositRefundDate ? new Date(depositRefundDate) : null,
          depositStatus: depositStatus || (depositRefunded > 0 ? 'REFUNDED' : 'FORFEITED'),
          isActive: false,
          notes: notes || tenancy.notes,
        },
        include: {
          tenant: true,
          unit: {
            include: {
              property: true,
            },
          },
        },
      });

      // Update unit status to VACANT
      await tx.unit.update({
        where: { id: tenancy.unitId },
        data: { status: 'VACANT' },
      });

      // Update tenant status to FORMER
      await tx.tenant.update({
        where: { id: tenancy.tenantId },
        data: { status: 'FORMER' },
      });

      return updatedTenancy;
    });

    logger.info('Tenant moved out', {
      tenancyId: id,
      tenantId: tenancy.tenantId,
      unitId: tenancy.unitId,
    });

    return successResponse(res, result, 'Tenant moved out successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenancy by ID
 */
export const getTenancyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const tenancy = await prisma.tenancy.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!tenancy) {
      return errorResponse(
        res,
        'Tenancy not found.',
        'NOT_FOUND',
        404
      );
    }

    return successResponse(res, tenancy);
  } catch (error) {
    next(error);
  }
};

