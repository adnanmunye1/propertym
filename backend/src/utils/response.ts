import { Response } from 'express';

/**
 * Standard success response
 */
export const successResponse = (
  res: Response,
  data: any,
  message?: string,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message && { message }),
  });
};

/**
 * Paginated response
 */
export const paginatedResponse = (
  res: Response,
  data: any[],
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  },
  message?: string
) => {
  return res.status(200).json({
    success: true,
    data,
    pagination,
    ...(message && { message }),
  });
};

/**
 * Error response
 */
export const errorResponse = (
  res: Response,
  message: string,
  code: string = 'ERROR',
  statusCode: number = 500,
  details?: any
) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
  });
};

