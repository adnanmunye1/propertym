import { Request, Response, NextFunction } from 'express';
import { Parser } from 'json2csv';
// import * as XLSX from 'xlsx'; // Reserved for future Excel export
import prisma from '../utils/prisma';
import { successResponse, errorResponse } from '../utils/response';
import { logger } from '../utils/logger';

/**
 * Payments Report
 */
export const getPaymentsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { startDate, endDate, propertyId, tenantId, method } = req.query;

    const where: any = {};

    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(startDate as string);
      if (endDate) where.paymentDate.lte = new Date(endDate as string);
    }

    if (tenantId) where.tenantId = tenantId as string;
    if (method) where.method = method;
    if (propertyId) {
      where.unit = { propertyId: propertyId as string };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        tenant: {
          select: { firstName: true, lastName: true, phone: true },
        },
        unit: {
          select: {
            name: true,
            property: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    const reportData = payments.map(p => ({
      date: p.paymentDate.toISOString().split('T')[0],
      tenant: `${p.tenant.firstName} ${p.tenant.lastName}`,
      phone: p.tenant.phone,
      unit: p.unit.name,
      property: p.unit.property.name,
      amount: Number(p.amount),
      method: p.method,
      reference: p.reference || '',
      notes: p.notes || '',
    }));

    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + Number(p.amount), 0),
    };

    return successResponse(res, { payments: reportData, summary });
  } catch (error) {
    next(error);
  }
};

/**
 * Arrears Report
 */
export const getArrearsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { minDays, propertyId } = req.query;

    const { getTenantsWithArrears } = await import('../services/arrears.service');
    let arrearsList = await getTenantsWithArrears();

    // Filter by minimum days overdue
    if (minDays) {
      const minDaysNum = parseInt(minDays as string);
      arrearsList = arrearsList.filter(t => t.daysOverdue >= minDaysNum);
    }

    // Filter by property (if specified)
    // This requires getting tenant's current unit's property
    if (propertyId) {
      const propertyTenants = await prisma.tenant.findMany({
        where: {
          tenancies: {
            some: {
              isActive: true,
              unit: {
                propertyId: propertyId as string,
              },
            },
          },
        },
        select: { id: true },
      });

      const propertyTenantIds = new Set(propertyTenants.map(t => t.id));
      arrearsList = arrearsList.filter(t => propertyTenantIds.has(t.tenantId));
    }

    const summary = {
      totalTenantsInArrears: arrearsList.length,
      totalArrearsAmount: arrearsList.reduce((sum, t) => sum + t.arrearsAmount, 0),
    };

    return successResponse(res, { arrears: arrearsList, summary });
  } catch (error) {
    next(error);
  }
};

/**
 * Occupancy Report
 */
export const getOccupancyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { propertyId } = req.query;

    const where: any = { isActive: true };
    if (propertyId) where.id = propertyId as string;

    const properties = await prisma.property.findMany({
      where,
      include: {
        units: {
          select: { status: true },
        },
      },
    });

    const reportData = properties.map(property => {
      const totalUnits = property.units.length;
      const occupied = property.units.filter(u => u.status === 'OCCUPIED').length;
      const vacant = property.units.filter(u => u.status === 'VACANT').length;
      const reserved = property.units.filter(u => u.status === 'RESERVED').length;
      const inactive = property.units.filter(u => u.status === 'INACTIVE').length;
      const occupancyRate = totalUnits > 0 ? (occupied / totalUnits) * 100 : 0;

      return {
        propertyId: property.id,
        propertyName: property.name,
        propertyType: property.type,
        totalUnits,
        occupied,
        vacant,
        reserved,
        inactive,
        occupancyRate: Math.round(occupancyRate * 10) / 10,
      };
    });

    const summary = {
      totalProperties: properties.length,
      totalUnits: reportData.reduce((sum, p) => sum + p.totalUnits, 0),
      totalOccupied: reportData.reduce((sum, p) => sum + p.occupied, 0),
      totalVacant: reportData.reduce((sum, p) => sum + p.vacant, 0),
      overallOccupancyRate:
        reportData.reduce((sum, p) => sum + p.totalUnits, 0) > 0
          ? Math.round(
              (reportData.reduce((sum, p) => sum + p.occupied, 0) /
                reportData.reduce((sum, p) => sum + p.totalUnits, 0)) *
                1000
            ) / 10
          : 0,
    };

    return successResponse(res, { properties: reportData, summary });
  } catch (error) {
    next(error);
  }
};

/**
 * Export report to CSV
 */
export const exportReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { type } = req.params;

    let data: any[] = [];
    let fields: string[] = [];
    let filename = 'report.csv';

    if (type === 'payments') {
      const { startDate, endDate, propertyId, tenantId, method } = req.query;
      const where: any = {};

      if (startDate || endDate) {
        where.paymentDate = {};
        if (startDate) where.paymentDate.gte = new Date(startDate as string);
        if (endDate) where.paymentDate.lte = new Date(endDate as string);
      }

      if (tenantId) where.tenantId = tenantId as string;
      if (method) where.method = method;
      if (propertyId) where.unit = { propertyId: propertyId as string };

      const payments = await prisma.payment.findMany({
        where,
        include: {
          tenant: true,
          unit: {
            include: { property: true },
          },
        },
        orderBy: { paymentDate: 'desc' },
      });

      data = payments.map(p => ({
        Date: p.paymentDate.toISOString().split('T')[0],
        Tenant: `${p.tenant.firstName} ${p.tenant.lastName}`,
        Phone: p.tenant.phone,
        Unit: p.unit.name,
        Property: p.unit.property.name,
        Amount: Number(p.amount),
        Method: p.method,
        Reference: p.reference || '',
      }));

      fields = ['Date', 'Tenant', 'Phone', 'Unit', 'Property', 'Amount', 'Method', 'Reference'];
      filename = `payments-report-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'arrears') {
      const { getTenantsWithArrears } = await import('../services/arrears.service');
      const arrearsList = await getTenantsWithArrears();

      data = arrearsList.map(t => ({
        Tenant: t.tenantName,
        Unit: t.unitName,
        Property: t.propertyName,
        'Arrears Amount': t.arrearsAmount,
        'Days Overdue': t.daysOverdue,
        'Invoice Count': t.invoiceCount,
      }));

      fields = ['Tenant', 'Unit', 'Property', 'Arrears Amount', 'Days Overdue', 'Invoice Count'];
      filename = `arrears-report-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (type === 'occupancy') {
      const properties = await prisma.property.findMany({
        where: { isActive: true },
        include: { units: true },
      });

      data = properties.map(property => {
        const totalUnits = property.units.length;
        const occupied = property.units.filter(u => u.status === 'OCCUPIED').length;
        const vacant = property.units.filter(u => u.status === 'VACANT').length;
        const occupancyRate = totalUnits > 0 ? (occupied / totalUnits) * 100 : 0;

        return {
          Property: property.name,
          Type: property.type,
          'Total Units': totalUnits,
          Occupied: occupied,
          Vacant: vacant,
          'Occupancy Rate': `${Math.round(occupancyRate)}%`,
        };
      });

      fields = ['Property', 'Type', 'Total Units', 'Occupied', 'Vacant', 'Occupancy Rate'];
      filename = `occupancy-report-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      return errorResponse(res, 'Invalid report type.', 'VALIDATION_ERROR', 400);
    }

    // Generate CSV
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);

    logger.info('Report exported', { type, recordCount: data.length });
  } catch (error) {
    next(error);
  }
};

