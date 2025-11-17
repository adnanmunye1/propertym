import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Get all invoices (with pagination and filters)
 */
export const getInvoices = async (
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
      period,
      status,
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    const where: any = {};

    if (tenantId) where.tenantId = tenantId as string;
    if (unitId) where.unitId = unitId as string;
    if (period) where.period = period as string;
    if (status) where.status = status;

    const total = await prisma.invoice.count({ where });

    const invoices = await prisma.invoice.findMany({
      where,
      skip,
      take: pageSizeNum,
      include: {
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        unit: {
          select: {
            id: true,
            name: true,
            property: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            method: true,
          },
        },
      },
      orderBy: { dueDate: 'desc' },
    });

    return paginatedResponse(res, invoices, {
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
 * Get invoice by ID
 */
export const getInvoiceById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
        tenancy: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
      },
    });

    if (!invoice) {
      return errorResponse(res, 'Invoice not found.', 'NOT_FOUND', 404);
    }

    return successResponse(res, invoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Create single invoice
 */
export const createInvoice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      tenancyId,
      period,
      dueDate,
      rentAmount,
      additionalCharges,
      notes,
    } = req.body;

    // Validation
    if (!tenancyId || !period || !dueDate || rentAmount === undefined) {
      return errorResponse(
        res,
        'Tenancy, period, due date, and rent amount are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate period format (YYYY-MM)
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      return errorResponse(
        res,
        'Period must be in YYYY-MM format (e.g., 2025-11).',
        'VALIDATION_ERROR',
        400
      );
    }

    // Get tenancy
    const tenancy = await prisma.tenancy.findUnique({
      where: { id: tenancyId },
      include: {
        tenant: true,
        unit: true,
      },
    });

    if (!tenancy) {
      return errorResponse(res, 'Tenancy not found.', 'NOT_FOUND', 404);
    }

    if (!tenancy.isActive) {
      return errorResponse(
        res,
        'Cannot create invoice for inactive tenancy.',
        'TENANCY_INACTIVE',
        400
      );
    }

    // Check for duplicate invoice for this period
    const existing = await prisma.invoice.findFirst({
      where: {
        tenancyId,
        period,
      },
    });

    if (existing) {
      return errorResponse(
        res,
        `An invoice for period ${period} already exists for this tenancy.`,
        'DUPLICATE_INVOICE',
        409
      );
    }

    // Validate amounts
    const rent = parseFloat(rentAmount);
    const additional = parseFloat(additionalCharges || 0);

    if (isNaN(rent) || rent <= 0) {
      return errorResponse(
        res,
        'Rent amount must be greater than 0.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (isNaN(additional) || additional < 0) {
      return errorResponse(
        res,
        'Additional charges must be 0 or greater.',
        'VALIDATION_ERROR',
        400
      );
    }

    const totalAmount = rent + additional;

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        tenancyId,
        tenantId: tenancy.tenantId,
        unitId: tenancy.unitId,
        period,
        dueDate: new Date(dueDate),
        rentAmount: rent,
        additionalCharges: additional,
        totalAmount,
        paidAmount: 0,
        status: 'PENDING',
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

    logger.info('Invoice created', {
      invoiceId: invoice.id,
      period,
      tenantId: tenancy.tenantId,
    });

    return successResponse(res, invoice, 'Invoice created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk generate invoices for a period
 */
export const generateInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { period, dueDate, additionalCharges } = req.body;

    // Validation
    if (!period || !dueDate) {
      return errorResponse(
        res,
        'Period and due date are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate period format
    const periodRegex = /^\d{4}-\d{2}$/;
    if (!periodRegex.test(period)) {
      return errorResponse(
        res,
        'Period must be in YYYY-MM format.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Get all active tenancies
    const activeTenancies = await prisma.tenancy.findMany({
      where: { isActive: true },
      include: {
        tenant: true,
        unit: true,
      },
    });

    if (activeTenancies.length === 0) {
      return errorResponse(
        res,
        'No active tenancies found.',
        'NO_ACTIVE_TENANCIES',
        404
      );
    }

    // Check which tenancies already have invoices for this period
    const existingInvoices = await prisma.invoice.findMany({
      where: {
        period,
        tenancyId: {
          in: activeTenancies.map(t => t.id),
        },
      },
    });

    const existingTenancyIds = new Set(existingInvoices.map(inv => inv.tenancyId));

    // Filter to tenancies without invoices for this period
    const tenanciesNeedingInvoices = activeTenancies.filter(
      t => !existingTenancyIds.has(t.id)
    );

    if (tenanciesNeedingInvoices.length === 0) {
      return errorResponse(
        res,
        `All active tenancies already have invoices for ${period}.`,
        'ALL_INVOICES_EXIST',
        409
      );
    }

    // Create invoices for all tenancies
    const additional = parseFloat(additionalCharges || 0);

    const invoices = await prisma.invoice.createMany({
      data: tenanciesNeedingInvoices.map(tenancy => ({
        tenancyId: tenancy.id,
        tenantId: tenancy.tenantId,
        unitId: tenancy.unitId,
        period,
        dueDate: new Date(dueDate),
        rentAmount: Number(tenancy.unit.rentAmount),
        additionalCharges: additional,
        totalAmount: Number(tenancy.unit.rentAmount) + additional,
        paidAmount: 0,
        status: 'PENDING' as any,
      })),
    });

    logger.info('Bulk invoices generated', {
      period,
      count: invoices.count,
    });

    return successResponse(
      res,
      {
        count: invoices.count,
        period,
        skipped: existingInvoices.length,
      },
      `Successfully generated ${invoices.count} invoices for ${period}.`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get invoices for a tenant
 */
export const getTenantInvoices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { tenantId } = req.params;

    const invoices = await prisma.invoice.findMany({
      where: { tenantId },
      include: {
        unit: {
          select: {
            name: true,
            property: {
              select: {
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            method: true,
          },
        },
      },
      orderBy: { period: 'desc' },
    });

    return successResponse(res, invoices);
  } catch (error) {
    next(error);
  }
};

/**
 * Update invoice status based on payments
 */
export const updateInvoiceStatus = async (invoiceId: string): Promise<void> => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let newStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' = 'PENDING';

  if (Number(invoice.paidAmount) >= Number(invoice.totalAmount)) {
    newStatus = 'PAID';
  } else if (Number(invoice.paidAmount) > 0) {
    newStatus = 'PARTIALLY_PAID';
  } else if (invoice.dueDate < today) {
    newStatus = 'OVERDUE';
  }

  if (newStatus !== invoice.status) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: newStatus },
    });
  }
};

