import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Get all documents (with pagination and filters)
 */
export const getDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      page = '1',
      pageSize = '20',
      documentType,
      entityType,
      propertyId,
      unitId,
      tenantId,
      search,
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    const where: any = {};

    if (documentType) where.documentType = documentType;
    if (entityType) where.entityType = entityType;
    if (propertyId) where.propertyId = propertyId as string;
    if (unitId) where.unitId = unitId as string;
    if (tenantId) where.tenantId = tenantId as string;

    if (search) {
      where.OR = [
        { fileName: { contains: search as string, mode: 'insensitive' } },
        { notes: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.document.count({ where });

    const documents = await prisma.document.findMany({
      where,
      skip,
      take: pageSizeNum,
      include: {
        property: {
          select: { id: true, name: true },
        },
        unit: {
          select: { id: true, name: true },
        },
        tenant: {
          select: { id: true, firstName: true, lastName: true },
        },
        uploader: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return paginatedResponse(res, documents, {
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
 * Upload document
 */
export const uploadDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      documentType,
      entityType,
      propertyId,
      unitId,
      tenantId,
      notes,
    } = req.body;

    // Validation
    if (!documentType || !entityType) {
      return errorResponse(
        res,
        'Document type and entity type are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    if (!req.file) {
      return errorResponse(
        res,
        'No file provided.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate entity exists
    if (entityType === 'PROPERTY' && propertyId) {
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) {
        return errorResponse(res, 'Property not found.', 'NOT_FOUND', 404);
      }
    }

    if (entityType === 'UNIT' && unitId) {
      const unit = await prisma.unit.findUnique({ where: { id: unitId } });
      if (!unit) {
        return errorResponse(res, 'Unit not found.', 'NOT_FOUND', 404);
      }
    }

    if (entityType === 'TENANT' && tenantId) {
      const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant) {
        return errorResponse(res, 'Tenant not found.', 'NOT_FOUND', 404);
      }
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        storageKey: req.file.filename,
        storageUrl: `/uploads/${req.file.filename}`,
        documentType,
        entityType,
        propertyId: propertyId || null,
        unitId: unitId || null,
        tenantId: tenantId || null,
        uploadedBy: req.user!.userId,
        notes,
      },
      include: {
        property: {
          select: { id: true, name: true },
        },
        unit: {
          select: { id: true, name: true },
        },
        tenant: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    logger.info('Document uploaded', {
      documentId: document.id,
      fileName: req.file.originalname,
      entityType,
    });

    return successResponse(res, document, 'Document uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get document by ID
 */
export const getDocumentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        property: true,
        unit: true,
        tenant: true,
        uploader: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    if (!document) {
      return errorResponse(res, 'Document not found.', 'NOT_FOUND', 404);
    }

    return successResponse(res, document);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete document
 */
export const deleteDocument = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      return errorResponse(res, 'Document not found.', 'NOT_FOUND', 404);
    }

    // Delete from database
    await prisma.document.delete({
      where: { id },
    });

    // Delete file from storage (handled by upload service)
    // For now, file remains in uploads folder

    logger.info('Document deleted', { documentId: id });

    return successResponse(res, null, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get documents for a specific entity
 */
export const getEntityDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { entityType, entityId } = req.params;

    const where: any = { entityType: entityType.toUpperCase() };

    if (entityType.toUpperCase() === 'PROPERTY') {
      where.propertyId = entityId;
    } else if (entityType.toUpperCase() === 'UNIT') {
      where.unitId = entityId;
    } else if (entityType.toUpperCase() === 'TENANT') {
      where.tenantId = entityId;
    }

    const documents = await prisma.document.findMany({
      where,
      include: {
        uploader: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, documents);
  } catch (error) {
    next(error);
  }
};

