import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Get all units (with pagination and filters)
 */
export const getUnits = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      page = '1',
      pageSize = '20',
      propertyId,
      status,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    // Build where clause
    const where: any = {};

    if (propertyId) {
      where.propertyId = propertyId as string;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.unit.count({ where });

    // Get units
    const units = await prisma.unit.findMany({
      where,
      skip,
      take: pageSizeNum,
      include: {
        property: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        tenancies: {
          where: { isActive: true },
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: [
        { property: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    return paginatedResponse(
      res,
      units,
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
 * Get unit by ID
 */
export const getUnitById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        property: true,
        tenancies: {
          include: {
            tenant: true,
          },
          orderBy: { moveInDate: 'desc' },
        },
        images: {
          orderBy: { createdAt: 'desc' },
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

    return successResponse(res, unit);
  } catch (error) {
    next(error);
  }
};

/**
 * Create unit
 */
export const createUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      propertyId,
      name,
      bedrooms,
      bathrooms,
      floor,
      size,
      rentAmount,
      depositAmount,
      status,
      notes,
    } = req.body;

    // Validation
    if (!propertyId || !name || rentAmount === undefined || depositAmount === undefined) {
      return errorResponse(
        res,
        'Property, unit name, rent amount, and deposit amount are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return errorResponse(
        res,
        'Property not found.',
        'NOT_FOUND',
        404
      );
    }

    // Validate amounts
    const rent = parseFloat(rentAmount);
    const deposit = parseFloat(depositAmount);

    if (isNaN(rent) || rent <= 0) {
      return errorResponse(
        res,
        'Rent amount must be greater than 0.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (isNaN(deposit) || deposit < 0) {
      return errorResponse(
        res,
        'Deposit amount must be 0 or greater.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (rent > 10000000) {
      return errorResponse(
        res,
        'Rent amount seems unreasonably high. Please check.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Check for duplicate unit name in property
    const duplicate = await prisma.unit.findFirst({
      where: {
        propertyId,
        name: name.trim(),
      },
    });

    if (duplicate) {
      return errorResponse(
        res,
        `A unit named "${name}" already exists in this property.`,
        'DUPLICATE_UNIT',
        409
      );
    }

    // Create unit
    const unit = await prisma.unit.create({
      data: {
        propertyId,
        name: name.trim(),
        bedrooms,
        bathrooms,
        floor,
        size: size ? parseFloat(size) : null,
        rentAmount: rent,
        depositAmount: deposit,
        status: status || 'VACANT',
        notes,
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Unit created', { unitId: unit.id, propertyId, name });

    return successResponse(
      res,
      unit,
      'Unit created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update unit
 */
export const updateUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      name,
      bedrooms,
      bathrooms,
      floor,
      size,
      rentAmount,
      depositAmount,
      status,
      notes,
    } = req.body;

    // Check if unit exists
    const existing = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(
        res,
        'Unit not found.',
        'NOT_FOUND',
        404
      );
    }

    // Validate amounts if provided
    if (rentAmount !== undefined) {
      const rent = parseFloat(rentAmount);
      if (isNaN(rent) || rent <= 0) {
        return errorResponse(
          res,
          'Rent amount must be greater than 0.',
          'VALIDATION_ERROR',
          400
        );
      }
    }

    if (depositAmount !== undefined) {
      const deposit = parseFloat(depositAmount);
      if (isNaN(deposit) || deposit < 0) {
        return errorResponse(
          res,
          'Deposit amount must be 0 or greater.',
          'VALIDATION_ERROR',
          400
        );
      }
    }

    // Check for duplicate unit name if changing name
    if (name && name !== existing.name) {
      const duplicate = await prisma.unit.findFirst({
        where: {
          propertyId: existing.propertyId,
          name: name.trim(),
          id: { not: id },
        },
      });

      if (duplicate) {
        return errorResponse(
          res,
          `A unit named "${name}" already exists in this property.`,
          'DUPLICATE_UNIT',
          409
        );
      }
    }

    // Update unit
    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(bedrooms !== undefined && { bedrooms }),
        ...(bathrooms !== undefined && { bathrooms }),
        ...(floor !== undefined && { floor }),
        ...(size !== undefined && { size: size ? parseFloat(size) : null }),
        ...(rentAmount !== undefined && { rentAmount: parseFloat(rentAmount) }),
        ...(depositAmount !== undefined && { depositAmount: parseFloat(depositAmount) }),
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        property: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info('Unit updated', { unitId: id });

    return successResponse(res, unit, 'Unit updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete/Archive unit
 */
export const deleteUnit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    // Check if unit exists
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        tenancies: true,
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

    // If unit has tenancy history, only allow soft delete
    if (unit.tenancies.length > 0 && force !== 'true') {
      const updated = await prisma.unit.update({
        where: { id },
        data: { status: 'INACTIVE' },
      });

      logger.info('Unit archived', { unitId: id });

      return successResponse(
        res,
        updated,
        'Unit archived successfully. It has history and cannot be permanently deleted.'
      );
    }

    // Hard delete if no history
    await prisma.unit.delete({
      where: { id },
    });

    logger.info('Unit deleted', { unitId: id });

    return successResponse(res, null, 'Unit deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload unit image
 */
export const uploadUnitImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { isPrimary } = req.body;

    // Check if unit exists
    const unit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!unit) {
      return errorResponse(
        res,
        'Unit not found.',
        'NOT_FOUND',
        404
      );
    }

    if (!req.file) {
      return errorResponse(
        res,
        'No image file provided.',
        'VALIDATION_ERROR',
        400
      );
    }

    // If setting as primary, unset other primary images
    if (isPrimary === 'true' || isPrimary === true) {
      await prisma.unitImage.updateMany({
        where: { unitId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create image record
    const image = await prisma.unitImage.create({
      data: {
        unitId: id,
        fileName: req.file.originalname,
        storageKey: req.file.filename,
        storageUrl: `/uploads/${req.file.filename}`,
        isPrimary: isPrimary === 'true' || isPrimary === true,
      },
    });

    logger.info('Unit image uploaded', { unitId: id, imageId: image.id });

    return successResponse(res, image, 'Image uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete unit image
 */
export const deleteUnitImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id, imageId } = req.params;

    const image = await prisma.unitImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.unitId !== id) {
      return errorResponse(
        res,
        'Image not found.',
        'NOT_FOUND',
        404
      );
    }

    await prisma.unitImage.delete({
      where: { id: imageId },
    });

    logger.info('Unit image deleted', { unitId: id, imageId });

    return successResponse(res, null, 'Image deleted successfully');
  } catch (error) {
    next(error);
  }
};

