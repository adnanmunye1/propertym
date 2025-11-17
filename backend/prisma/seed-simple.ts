import { PrismaClient, PropertyType, UnitStatus, TenantStatus, PaymentMethod, DepositStatus, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test data...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.payment.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.tenancy.deleteMany({});
  await prisma.tenant.deleteMany({});
  await prisma.unitImage.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.propertyImage.deleteMany({});
  await prisma.property.deleteMany({});

  // Create demo user if doesn't exist
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@propertym.com' },
  });

  if (!existingUser) {
    console.log('Creating demo user...');
    const hashedPassword = await bcrypt.hash('Demo@123', 10);
    await prisma.user.create({
      data: {
        email: 'demo@propertym.com',
        password: hashedPassword,
        firstName: 'Demo',
        lastName: 'User',
        role: 'OWNER',
      },
    });
    console.log('✅ Demo user created: demo@propertym.com / Demo@123');
  } else {
    console.log('✅ Using existing demo user');
  }

  // Create Properties
  console.log('Creating properties...');
  const property1 = await prisma.property.create({
    data: {
      name: 'Sunrise Apartments',
      type: PropertyType.APARTMENT_BLOCK,
      address: '123 Kimathi Street',
      town: 'Nairobi',
      county: 'Nairobi',
      description: 'Modern apartments in the heart of Nairobi CBD',
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Green Valley Villas',
      type: PropertyType.SINGLE_HOUSE,
      address: '45 Ngong Road',
      town: 'Nairobi',
      county: 'Nairobi',
      description: 'Luxurious standalone villas with gardens',
    },
  });

  console.log('✅ Created 2 properties');

  // Create Units
  console.log('Creating units...');
  const units = [];

  // Sunrise Apartments - 8 units
  for (let i = 1; i <= 8; i++) {
    units.push(
      await prisma.unit.create({
        data: {
          propertyId: property1.id,
          name: `${i}A`,
          bedrooms: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
          bathrooms: i % 3 === 0 ? 2 : 1,
          rentAmount: i % 3 === 0 ? 35000 : i % 2 === 0 ? 25000 : 18000,
          depositAmount: i % 3 === 0 ? 35000 : i % 2 === 0 ? 25000 : 18000,
          status: i <= 6 ? UnitStatus.OCCUPIED : UnitStatus.VACANT,
        },
      })
    );
  }

  // Green Valley Villas - 4 villas
  for (let i = 1; i <= 4; i++) {
    units.push(
      await prisma.unit.create({
        data: {
          propertyId: property2.id,
          name: `Villa ${i}`,
          bedrooms: 4,
          bathrooms: 3,
          rentAmount: 75000,
          depositAmount: 150000,
          status: i <= 3 ? UnitStatus.OCCUPIED : UnitStatus.VACANT,
        },
      })
    );
  }

  console.log(`✅ Created ${units.length} units`);

  // Create Tenants
  console.log('Creating tenants...');
  const tenantNames = [
    { firstName: 'John', lastName: 'Kamau', phone: '+254712345678', idNumber: '12345678' },
    { firstName: 'Mary', lastName: 'Wanjiru', phone: '+254723456789', idNumber: '23456789' },
    { firstName: 'Peter', lastName: 'Ochieng', phone: '+254734567890', idNumber: '34567890' },
    { firstName: 'Grace', lastName: 'Akinyi', phone: '+254745678901', idNumber: '45678901' },
    { firstName: 'David', lastName: 'Mwangi', phone: '+254756789012', idNumber: '56789012' },
    { firstName: 'Jane', lastName: 'Njeri', phone: '+254767890123', idNumber: '67890123' },
    { firstName: 'James', lastName: 'Otieno', phone: '+254778901234', idNumber: '78901234' },
    { firstName: 'Sarah', lastName: 'Chebet', phone: '+254789012345', idNumber: '89012345' },
    { firstName: 'Michael', lastName: 'Kipchoge', phone: '+254790123456', idNumber: '90123456' },
  ];

  const tenants = [];
  for (const data of tenantNames) {
    tenants.push(
      await prisma.tenant.create({
        data: {
          ...data,
          email: `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@email.com`,
          emergencyContactName: `${data.firstName} Emergency`,
          emergencyContactPhone: data.phone.replace(/\d{3}$/, '999'),
          status: TenantStatus.ACTIVE,
        },
      })
    );
  }

  console.log(`✅ Created ${tenants.length} tenants`);

  // Create Tenancies (only for occupied units)
  console.log('Creating tenancies...');
  const occupiedUnits = units.filter((u) => u.status === UnitStatus.OCCUPIED);
  const tenancies = [];

  for (let i = 0; i < occupiedUnits.length && i < tenants.length; i++) {
    const unit = occupiedUnits[i];
    const tenant = tenants[i];
    const moveInDate = new Date();
    moveInDate.setMonth(moveInDate.getMonth() - Math.floor(Math.random() * 6)); // Moved in 0-6 months ago

    tenancies.push(
      await prisma.tenancy.create({
        data: {
          tenantId: tenant.id,
          unitId: unit.id,
          moveInDate,
          depositPaid: unit.depositAmount,
          depositPaidDate: moveInDate,
          depositStatus: DepositStatus.HELD,
          isActive: true,
        },
      })
    );
  }

  console.log(`✅ Created ${tenancies.length} tenancies`);

  // Create Invoices and Payments
  console.log('Creating invoices and payments...');
  let invoiceCount = 0;
  let paymentCount = 0;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  for (const tenancy of tenancies) {
    const unit = units.find((u) => u.id === tenancy.unitId)!;
    
    // Create invoice for current month
    const dueDate = new Date(currentYear, currentMonth, 5);
    const period = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    const invoice = await prisma.invoice.create({
      data: {
        tenancyId: tenancy.id,
        tenantId: tenancy.tenantId,
        unitId: unit.id,
        period,
        dueDate,
        rentAmount: unit.rentAmount,
        totalAmount: unit.rentAmount,
        paidAmount: 0,
        status: InvoiceStatus.PENDING,
      },
    });
    invoiceCount++;

    // 70% of tenants have paid
    if (Math.random() > 0.3) {
      const paymentDate = new Date(currentYear, currentMonth, Math.floor(Math.random() * 10) + 1);
      await prisma.payment.create({
        data: {
          tenantId: tenancy.tenantId,
          unitId: unit.id,
          invoiceId: invoice.id,
          amount: unit.rentAmount,
          paymentDate,
          method: PaymentMethod.MPESA,
          reference: `MPO${Math.random().toString().substring(2, 12)}`,
          notes: `Rent for ${period}`,
        },
      });

      // Update invoice as paid
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: unit.rentAmount,
          status: InvoiceStatus.PAID,
        },
      });
      paymentCount++;
    }
  }

  console.log(`✅ Created ${invoiceCount} invoices and ${paymentCount} payments`);

  // Summary
  console.log('\n🎉 Seed data created successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Properties: 2`);
  console.log(`   - Units: ${units.length} (${occupiedUnits.length} occupied, ${units.filter((u) => u.status === UnitStatus.VACANT).length} vacant)`);
  console.log(`   - Tenants: ${tenants.length}`);
  console.log(`   - Active Tenancies: ${tenancies.length}`);
  console.log(`   - Invoices: ${invoiceCount}`);
  console.log(`   - Payments: ${paymentCount}`);
  console.log(`   - Tenants with unpaid rent: ${invoiceCount - paymentCount}`);
  console.log('\n👤 Demo User Credentials:');
  console.log('   Email: demo@propertym.com');
  console.log('   Password: Demo@123');
  console.log('\n🌐 Login at: http://localhost:8080\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

