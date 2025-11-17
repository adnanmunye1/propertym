import prisma from '../utils/prisma';

/**
 * Calculate balance and arrears for a tenant
 */
export async function calculateTenantBalance(tenantId: string) {
  // Get all invoices for tenant
  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
  });

  // Get all payments for tenant
  const payments = await prisma.payment.findMany({
    where: { tenantId },
  });

  // Calculate totals
  const totalBilled = invoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount),
    0
  );

  const totalPaid = payments.reduce(
    (sum, pay) => sum + Number(pay.amount),
    0
  );

  const balance = totalBilled - totalPaid;

  // Calculate arrears (only overdue invoices)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueInvoices = invoices.filter(
    inv =>
      inv.dueDate < today &&
      Number(inv.paidAmount) < Number(inv.totalAmount)
  );

  const arrears = overdueInvoices.reduce(
    (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)),
    0
  );

  // Calculate days overdue (oldest unpaid invoice)
  let daysOverdue = 0;
  if (overdueInvoices.length > 0) {
    const oldestOverdue = overdueInvoices.reduce((oldest, inv) =>
      inv.dueDate < oldest.dueDate ? inv : oldest
    );

    const diffTime = today.getTime() - oldestOverdue.dueDate.getTime();
    daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    totalBilled,
    totalPaid,
    balance,
    arrears,
    daysOverdue,
    overdueInvoiceCount: overdueInvoices.length,
  };
}

/**
 * Get tenants with arrears
 */
export async function getTenantsWithArrears() {
  const activeInvoices = await prisma.invoice.findMany({
    where: {
      dueDate: {
        lt: new Date(),
      },
      status: {
        in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'],
      },
    },
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
          name: true,
          property: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  // Group by tenant and calculate arrears
  const tenantArrearsMap = new Map();

  for (const invoice of activeInvoices) {
    const arrearsAmount = Number(invoice.totalAmount) - Number(invoice.paidAmount);
    
    if (arrearsAmount > 0) {
      const existing = tenantArrearsMap.get(invoice.tenantId);

      if (existing) {
        existing.arrearsAmount += arrearsAmount;
        existing.invoiceCount += 1;
        // Update days overdue if this invoice is older
        const diffTime = new Date().getTime() - invoice.dueDate.getTime();
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (days > existing.daysOverdue) {
          existing.daysOverdue = days;
        }
      } else {
        const diffTime = new Date().getTime() - invoice.dueDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        tenantArrearsMap.set(invoice.tenantId, {
          tenantId: invoice.tenantId,
          tenantName: `${invoice.tenant.firstName} ${invoice.tenant.lastName}`,
          unitName: invoice.unit.name,
          propertyName: invoice.unit.property.name,
          arrearsAmount,
          daysOverdue,
          invoiceCount: 1,
        });
      }
    }
  }

  // Convert to array and sort by arrears amount descending
  const tenantsList = Array.from(tenantArrearsMap.values());
  tenantsList.sort((a, b) => b.arrearsAmount - a.arrearsAmount);

  return tenantsList;
}

/**
 * Calculate dashboard metrics
 */
export async function calculateDashboardMetrics() {
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM

  // Properties count
  const totalProperties = await prisma.property.count({
    where: { isActive: true },
  });

  // Units count
  const totalUnits = await prisma.unit.count();
  const occupiedUnits = await prisma.unit.count({
    where: { status: 'OCCUPIED' },
  });
  const vacantUnits = await prisma.unit.count({
    where: { status: 'VACANT' },
  });

  // Current month rent
  const currentMonthInvoices = await prisma.invoice.findMany({
    where: { period: currentMonth },
  });

  const rentDueThisMonth = currentMonthInvoices.reduce(
    (sum, inv) => sum + Number(inv.totalAmount),
    0
  );

  const rentReceivedThisMonth = currentMonthInvoices.reduce(
    (sum, inv) => sum + Number(inv.paidAmount),
    0
  );

  // Total arrears
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      dueDate: {
        lt: today,
      },
      status: {
        in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'],
      },
    },
  });

  const totalArrears = overdueInvoices.reduce(
    (sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.paidAmount)),
    0
  );

  // Count unique tenants in arrears
  const tenantsInArrears = new Set(
    overdueInvoices.map(inv => inv.tenantId)
  ).size;

  return {
    totalProperties,
    totalUnits,
    occupiedUnits,
    vacantUnits,
    rentDueThisMonth,
    rentReceivedThisMonth,
    totalArrears,
    tenantsInArrears,
  };
}

