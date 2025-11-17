import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Get all properties (with pagination and filters)
 */
export const getProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      page = '1',
      pageSize = '20',
      search,
      type,
      isActive,
      county,
      town,
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { area: { contains: search as string, mode: 'insensitive' } },
        { town: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (county) {
      where.county = { contains: county as string, mode: 'insensitive' };
    }

    if (town) {
      where.town = { contains: town as string, mode: 'insensitive' };
    }

    // Get total count
    const total = await prisma.property.count({ where });

    // Get properties
    const properties = await prisma.property.findMany({
      where,
      skip,
      take: pageSizeNum,
      include: {
        _count: {
          select: { units: true },
        },
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return paginatedResponse(
      res,
      properties,
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
 * Get property by ID
 */
export const getPropertyById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          include: {
            tenancies: {
              where: { isActive: true },
              include: {
                tenant: true,
              },
            },
          },
          orderBy: { name: 'asc' },
        },
        images: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!property) {
      return errorResponse(
        res,
        'Property not found.',
        'NOT_FOUND',
        404
      );
    }

    return successResponse(res, property);
  } catch (error) {
    next(error);
  }
};

/**
 * Create property
 */
export const createProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      name,
      type,
      area,
      town,
      county,
      address,
      description,
    } = req.body;

    // Validation
    if (!name || !type) {
      return errorResponse(
        res,
        'Property name and type are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (name.length > 255) {
      return errorResponse(
        res,
        'Property name must be less than 255 characters.',
        'VALIDATION_ERROR',
        400
      );
    }

    const validTypes = ['APARTMENT_BLOCK', 'SINGLE_HOUSE', 'BEDSITTER_BLOCK', 'COMMERCIAL', 'OTHER'];
    if (!validTypes.includes(type)) {
      return errorResponse(
        res,
        'Invalid property type.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Create property
    const property = await prisma.property.create({
      data: {
        name,
        type,
        area,
        town,
        county,
        address,
        description,
      },
    });

    logger.info('Property created', { propertyId: property.id, name });

    return successResponse(
      res,
      property,
      'Property created successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update property
 */
export const updateProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      area,
      town,
      county,
      address,
      description,
      isActive,
    } = req.body;

    // Check if property exists
    const existing = await prisma.property.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse(
        res,
        'Property not found.',
        'NOT_FOUND',
        404
      );
    }

    // Validation
    if (name && name.length > 255) {
      return errorResponse(
        res,
        'Property name must be less than 255 characters.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (type) {
      const validTypes = ['APARTMENT_BLOCK', 'SINGLE_HOUSE', 'BEDSITTER_BLOCK', 'COMMERCIAL', 'OTHER'];
      if (!validTypes.includes(type)) {
        return errorResponse(
          res,
          'Invalid property type.',
          'VALIDATION_ERROR',
          400
        );
      }
    }

    // Update property
    const property = await prisma.property.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(area !== undefined && { area }),
        ...(town !== undefined && { town }),
        ...(county !== undefined && { county }),
        ...(address !== undefined && { address }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: {
          select: { units: true },
        },
      },
    });

    logger.info('Property updated', { propertyId: id });

    return successResponse(res, property, 'Property updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete/Archive property
 */
export const deleteProperty = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: { units: true },
        },
      },
    });

    if (!property) {
      return errorResponse(
        res,
        'Property not found.',
        'NOT_FOUND',
        404
      );
    }

    // If property has units, only allow soft delete unless forced
    if (property._count.units > 0 && force !== 'true') {
      // Soft delete (archive)
      const updated = await prisma.property.update({
        where: { id },
        data: { isActive: false },
      });

      logger.info('Property archived', { propertyId: id });

      return successResponse(
        res,
        updated,
        'Property archived successfully. It has units and cannot be permanently deleted.'
      );
    }

    // Hard delete if no units or forced
    await prisma.property.delete({
      where: { id },
    });

    logger.info('Property deleted', { propertyId: id });

    return successResponse(res, null, 'Property deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Upload property image
 */
export const uploadPropertyImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const { isPrimary } = req.body;

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return errorResponse(
        res,
        'Property not found.',
        'NOT_FOUND',
        404
      );
    }

    // File should be in req.file (handled by multer middleware)
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
      await prisma.propertyImage.updateMany({
        where: { propertyId: id, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    // Create image record
    const image = await prisma.propertyImage.create({
      data: {
        propertyId: id,
        fileName: req.file.originalname,
        storageKey: req.file.filename,
        storageUrl: `/uploads/${req.file.filename}`,
        isPrimary: isPrimary === 'true' || isPrimary === true,
      },
    });

    logger.info('Property image uploaded', { propertyId: id, imageId: image.id });

    return successResponse(res, image, 'Image uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete property image
 */
export const deletePropertyImage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id, imageId } = req.params;

    const image = await prisma.propertyImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.propertyId !== id) {
      return errorResponse(
        res,
        'Image not found.',
        'NOT_FOUND',
        404
      );
    }

    // Delete from storage (handled by upload service)
    // For now, just delete the database record
    await prisma.propertyImage.delete({
      where: { id: imageId },
    });

    logger.info('Property image deleted', { propertyId: id, imageId });

    return successResponse(res, null, 'Image deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get property statistics
 */
export const getPropertyStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
          select: {
            status: true,
            rentAmount: true,
          },
        },
      },
    });

    if (!property) {
      return errorResponse(
        res,
        'Property not found.',
        'NOT_FOUND',
        404
      );
    }

    const stats = {
      totalUnits: property.units.length,
      occupied: property.units.filter(u => u.status === 'OCCUPIED').length,
      vacant: property.units.filter(u => u.status === 'VACANT').length,
      reserved: property.units.filter(u => u.status === 'RESERVED').length,
      inactive: property.units.filter(u => u.status === 'INACTIVE').length,
      totalMonthlyRent: property.units
        .filter(u => u.status === 'OCCUPIED')
        .reduce((sum, u) => sum + Number(u.rentAmount), 0),
    };

    return successResponse(res, stats);
  } catch (error) {
    next(error);
  }
};

