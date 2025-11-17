import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { errorResponse } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Prisma errors
  if (err.code && err.code.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token', 'INVALID_TOKEN', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired', 'TOKEN_EXPIRED', 401);
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 'VALIDATION_ERROR', 400, err.errors);
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong. Please try again.';
  const code = err.code || 'INTERNAL_ERROR';

  return errorResponse(res, message, code, statusCode);
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err: any, res: Response) => {
  switch (err.code) {
    case 'P2002':
      return errorResponse(
        res,
        'A record with this value already exists.',
        'DUPLICATE_ENTRY',
        409
      );

    case 'P2025':
      return errorResponse(
        res,
        'The requested record was not found.',
        'NOT_FOUND',
        404
      );

    case 'P2003':
      return errorResponse(
        res,
        'This operation violates a foreign key constraint.',
        'FOREIGN_KEY_VIOLATION',
        400
      );

    case 'P2014':
      return errorResponse(
        res,
        'This change would violate a required relation.',
        'RELATION_VIOLATION',
        400
      );

    default:
      return errorResponse(
        res,
        'A database error occurred. Please try again.',
        'DATABASE_ERROR',
        500
      );
  }
};

