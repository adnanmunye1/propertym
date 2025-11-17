import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { isValidKenyanPhone, formatKenyanPhone, isValidEmail } from '../utils/validation';

/**
 * Get all tenants (with pagination and filters)
 */
export const getTenants = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      page = '1',
      pageSize = '20',
      search,
      status,
      propertyId,
      unitId,
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { phone: { contains: search as string, mode: 'insensitive' } },
        { idNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get total count
    const total = await prisma.tenant.count({ where });

    // Get tenants
    const tenants = await prisma.tenant.findMany({
      where,
      skip,
      take: pageSizeNum,
      include: {
        tenancies: {
          where: { isActive: true },
          include: {
            unit: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Flatten active tenancy data for easier frontend use
    const tenantsWithCurrentUnit = tenants.map(tenant => ({
      ...tenant,
      currentTenancy: tenant.tenancies[0] || null,
      currentUnit: tenant.tenancies[0]?.unit || null,
      currentProperty: tenant.tenancies[0]?.unit?.property || null,
    }));

    return paginatedResponse(
      res,
      tenantsWithCurrentUnit,
      {
        page: pageNum,
        pageSize: pageSizeNum,
        total,
        totalPages: Math.ceil(total / pageSizeNum),
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant by ID
 */
export const getTenantById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        tenancies: {
          include: {
            unit: {
              include: {
                property: true,
              },
            },
          },
          orderBy: { moveInDate: 'desc' },
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

    // Add helper fields
    const currentTenancy = tenant.tenancies.find(t => t.isActive);
    
    return successResponse(res, {
      ...tenant,
      currentTenancy: currentTenancy || null,
      currentUnit: currentTenancy?.unit || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create tenant
 */
export const createTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      firstName,
      lastName,
      idNumber,
      phone,
      email,
      emergencyContactName,
      emergencyContactPhone,
      notes,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !idNumber || !phone) {
      return errorResponse(
        res,
        'First name, last name, ID number, and phone are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate phone number (Kenyan format)
    if (!isValidKenyanPhone(phone)) {
      return errorResponse(
        res,
        'Please enter a valid Kenyan phone number (e.g., +2547xxxxxxxx or 07xxxxxxxx).',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return errorResponse(
        res,
        'Please enter a valid email address.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate emergency phone if provided
    if (emergencyContactPhone && !isValidKenyanPhone(emergencyContactPhone)) {
      return errorResponse(
        res,
        'Please enter a valid emergency contact phone number.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check for duplicate phone number
    const existingTenant = await prisma.tenant.findFirst({
      where: { phone: formatKenyanPhone(phone) },
    });

    if (existingTenant) {
      return errorResponse(
        res,
        'A tenant with this phone number already exists.',
        'DUPLICATE_TENANT',
        409
      );
    }

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        firstName,
        lastName,
        idNumber,
        phone: formatKenyanPhone(phone),
        email,
        emergencyContactName,
        emergencyContactPhone: emergencyContactPhone 
          ? formatKenyanPhone(emergencyContactPhone) 
          : null,
        notes,
        status: 'ACTIVE', // Default status, will change based on tenancy
      },
    });

    logger.info('Tenant created', { tenantId: tenant.id, name: `${firstName} ${lastName}` });

    return successResponse(
      res,
      tenant,
      'Tenant created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update tenant
 */
export const updateTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      idNumber,
      phone,
      email,
      emergencyContactName,
      emergencyContactPhone,
      status,
      notes,
    } = req.body;

    // Check if tenant exists
    const existing = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(
        res,
        'Tenant not found.',
        'NOT_FOUND',
        404
      );
    }

    // Validate phone if provided
    if (phone && !isValidKenyanPhone(phone)) {
      return errorResponse(
        res,
        'Please enter a valid Kenyan phone number.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate email if provided
    if (email && !isValidEmail(email)) {
      return errorResponse(
        res,
        'Please enter a valid email address.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate emergency phone if provided
    if (emergencyContactPhone && !isValidKenyanPhone(emergencyContactPhone)) {
      return errorResponse(
        res,
        'Please enter a valid emergency contact phone number.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check for duplicate phone if changing
    if (phone && formatKenyanPhone(phone) !== existing.phone) {
      const duplicate = await prisma.tenant.findFirst({
        where: {
          phone: formatKenyanPhone(phone),
          id: { not: id },
        },
      });

      if (duplicate) {
        return errorResponse(
          res,
          'A tenant with this phone number already exists.',
          'DUPLICATE_TENANT',
          409
        );
      }
    }

    // Update tenant
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(idNumber && { idNumber }),
        ...(phone && { phone: formatKenyanPhone(phone) }),
        ...(email !== undefined && { email }),
        ...(emergencyContactName !== undefined && { emergencyContactName }),
        ...(emergencyContactPhone !== undefined && { 
          emergencyContactPhone: emergencyContactPhone 
            ? formatKenyanPhone(emergencyContactPhone) 
            : null 
        }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    logger.info('Tenant updated', { tenantId: id });

    return successResponse(res, tenant, 'Tenant updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get tenant balance and arrears
 */
export const getTenantBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant) {
      return errorResponse(
        res,
        'Tenant not found.',
        'NOT_FOUND',
        404
      );
    }

    // Import balance calculation
    const { calculateTenantBalance } = await import('../services/arrears.service');
    const balance = await calculateTenantBalance(id);

    return successResponse(res, balance);
  } catch (error) {
    next(error);
  }
};

