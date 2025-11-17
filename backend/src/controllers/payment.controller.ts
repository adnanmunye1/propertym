import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { logger } from '../utils/logger';
import { updateInvoiceStatus } from './invoice.controller';

/**
 * Get all payments (with pagination and filters)
 */
export const getPayments = async (
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
      propertyId,
      method,
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page as string);
    const pageSizeNum = parseInt(pageSize as string);
    const skip = (pageNum - 1) * pageSizeNum;

    const where: any = {};

    if (tenantId) where.tenantId = tenantId as string;
    if (unitId) where.unitId = unitId as string;
    if (method) where.method = method;

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate as string);
      if (endDate) where.paymentDate.lte = new Date(endDate as string);
    }

    // Property filter requires join through unit
    if (propertyId) {
      where.unit = {
        propertyId: propertyId as string,
      };
    }

    const total = await prisma.payment.count({ where });

    const payments = await prisma.payment.findMany({
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
        invoice: {
          select: {
            id: true,
            period: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return paginatedResponse(res, payments, {
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
 * Get payment by ID
 */
export const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: {
          include: {
            property: true,
          },
        },
        invoice: true,
      },
    });

    if (!payment) {
      return errorResponse(res, 'Payment not found.', 'NOT_FOUND', 404);
    }

    return successResponse(res, payment);
  } catch (error) {
    next(error);
  }
};

/**
 * Record payment
 */
export const createPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const {
      tenantId,
      unitId,
      invoiceId,
      paymentDate,
      amount,
      method,
      reference,
      notes,
    } = req.body;

    // Validation
    if (!tenantId || !unitId || !paymentDate || amount === undefined || !method) {
      return errorResponse(
        res,
        'Tenant, unit, payment date, amount, and method are required.',
        'VALIDATION_ERROR',
        400
      );
    }

    const paymentAmount = parseFloat(amount);

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return errorResponse(
        res,
        'Payment amount must be greater than 0.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Validate tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return errorResponse(res, 'Tenant not found.', 'NOT_FOUND', 404);
    }

    // Validate unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      return errorResponse(res, 'Unit not found.', 'NOT_FOUND', 404);
    }

    // Validate invoice if provided
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        return errorResponse(res, 'Invoice not found.', 'NOT_FOUND', 404);
      }

      if (invoice.tenantId !== tenantId) {
        return errorResponse(
          res,
          'Invoice does not belong to this tenant.',
          'VALIDATION_ERROR',
          400
        );
      }
    }

    // Validate payment method
    const validMethods = ['MPESA', 'BANK_TRANSFER', 'CASH', 'AIRTEL_MONEY', 'OTHER'];
    if (!validMethods.includes(method)) {
      return errorResponse(
        res,
        'Invalid payment method.',
        'VALIDATION_ERROR',
        400
      );
    }

    // Create payment and update invoice in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment
      const payment = await tx.payment.create({
        data: {
          tenantId,
          unitId,
          invoiceId,
          paymentDate: new Date(paymentDate),
          amount: paymentAmount,
          method,
          reference,
          notes,
        },
        include: {
          tenant: true,
          unit: {
            include: {
              property: true,
            },
          },
          invoice: true,
        },
      });

      // If payment is linked to an invoice, update the invoice
      if (invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
        });

        if (invoice) {
          const newPaidAmount = Number(invoice.paidAmount) + paymentAmount;

          await tx.invoice.update({
            where: { id: invoiceId },
            data: { paidAmount: newPaidAmount },
          });
        }
      }

      return payment;
    });

    // Update invoice status if applicable
    if (invoiceId) {
      await updateInvoiceStatus(invoiceId);
    }

    logger.info('Payment recorded', {
      paymentId: result.id,
      tenantId,
      amount: paymentAmount,
      method,
    });

    return successResponse(res, result, 'Payment recorded successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get payments for a tenant
 */
export const getTenantPayments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { tenantId } = req.params;

    const payments = await prisma.payment.findMany({
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
        invoice: {
          select: {
            period: true,
            totalAmount: true,
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return successResponse(res, payments);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete payment (with recalculation)
 */
export const deletePayment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return errorResponse(res, 'Payment not found.', 'NOT_FOUND', 404);
    }

    const invoiceId = payment.invoiceId;

    // Delete payment and update invoice in transaction
    await prisma.$transaction(async (tx) => {
      // If payment was linked to invoice, reduce paid amount
      if (invoiceId) {
        const invoice = await tx.invoice.findUnique({
          where: { id: invoiceId },
        });

        if (invoice) {
          const newPaidAmount = Number(invoice.paidAmount) - Number(payment.amount);

          await tx.invoice.update({
            where: { id: invoiceId },
            data: { paidAmount: Math.max(0, newPaidAmount) },
          });
        }
      }

      // Delete payment
      await tx.payment.delete({
        where: { id },
      });
    });

    // Update invoice status if applicable
    if (invoiceId) {
      await updateInvoiceStatus(invoiceId);
    }

    logger.info('Payment deleted', { paymentId: id });

    return successResponse(res, null, 'Payment deleted successfully');
  } catch (error) {
    next(error);
  }
};

