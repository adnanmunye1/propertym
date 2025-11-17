import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with test data...');

  // Clear existing test data (keep users)
  console.log('Clearing existing test data...');
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

  let user;
  if (!existingUser) {
    console.log('Creating demo user...');
    const hashedPassword = await bcrypt.hash('Demo@123', 10);
    user = await prisma.user.create({
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
    user = existingUser;
    console.log('✅ Using existing demo user');
  }

  // Create Properties
  console.log('Creating properties...');
  const property1 = await prisma.property.create({
    data: {
      name: 'Sunrise Apartments',
      address: '123 Kimathi Street',
      city: 'Nairobi',
      county: 'Nairobi',
      propertyType: 'APARTMENT',
      totalUnits: 12,
      description: 'Modern apartments in the heart of Nairobi CBD with excellent amenities',
      ownerId: user.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      name: 'Green Valley Villas',
      address: '45 Ngong Road',
      city: 'Nairobi',
      county: 'Nairobi',
      propertyType: 'HOUSE',
      totalUnits: 8,
      description: 'Luxurious standalone villas with gardens in a serene environment',
      ownerId: user.id,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      name: 'Downtown Commercial Complex',
      address: '78 Moi Avenue',
      city: 'Mombasa',
      county: 'Mombasa',
      propertyType: 'COMMERCIAL',
      totalUnits: 6,
      description: 'Prime commercial spaces in Mombasa CBD',
      ownerId: user.id,
    },
  });

  console.log('✅ Created 3 properties');

  // Create Units for Property 1 (Apartments)
  console.log('Creating units...');
  const units = [];

  // Sunrise Apartments - 12 units
  for (let i = 1; i <= 12; i++) {
    const floor = Math.ceil(i / 4);
    const unitOnFloor = ((i - 1) % 4) + 1;
    units.push(
      await prisma.unit.create({
        data: {
          propertyId: property1.id,
          unitNumber: `${floor}${String.fromCharCode(64 + unitOnFloor)}`, // 1A, 1B, 1C, 1D, 2A, etc.
          bedrooms: i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1,
          bathrooms: i % 3 === 0 ? 2 : 1,
          sqft: i % 3 === 0 ? 1200 : i % 2 === 0 ? 900 : 600,
          rentAmount: i % 3 === 0 ? 35000 : i % 2 === 0 ? 25000 : 18000,
          depositAmount: i % 3 === 0 ? 35000 : i % 2 === 0 ? 25000 : 18000,
          status: i <= 10 ? 'OCCUPIED' : 'VACANT',
          description: `${i % 3 === 0 ? '3' : i % 2 === 0 ? '2' : '1'} bedroom apartment on floor ${floor}`,
        },
      })
    );
  }

  // Green Valley Villas - 8 villas
  for (let i = 1; i <= 8; i++) {
    units.push(
      await prisma.unit.create({
        data: {
          propertyId: property2.id,
          unitNumber: `Villa ${i}`,
          bedrooms: 4,
          bathrooms: 3,
          sqft: 2500,
          rentAmount: 75000,
          depositAmount: 150000,
          status: i <= 6 ? 'OCCUPIED' : 'VACANT',
          description: `Spacious 4-bedroom villa with garden and parking`,
        },
      })
    );
  }

  // Downtown Commercial - 6 shops
  for (let i = 1; i <= 6; i++) {
    units.push(
      await prisma.unit.create({
        data: {
          propertyId: property3.id,
          unitNumber: `Shop ${i}`,
          bedrooms: 0,
          bathrooms: 1,
          sqft: 800,
          rentAmount: 45000,
          depositAmount: 90000,
          status: i <= 4 ? 'OCCUPIED' : i === 5 ? 'MAINTENANCE' : 'VACANT',
          description: `Commercial retail space`,
        },
      })
    );
  }

  console.log(`✅ Created ${units.length} units`);

  // Create Tenants
  console.log('Creating tenants...');
  const tenantData = [
    { firstName: 'John', lastName: 'Kamau', email: 'john.kamau@email.com', phone: '+254712345678', idNumber: '12345678' },
    { firstName: 'Mary', lastName: 'Wanjiru', email: 'mary.wanjiru@email.com', phone: '+254723456789', idNumber: '23456789' },
    { firstName: 'Peter', lastName: 'Ochieng', email: 'peter.ochieng@email.com', phone: '+254734567890', idNumber: '34567890' },
    { firstName: 'Grace', lastName: 'Akinyi', email: 'grace.akinyi@email.com', phone: '+254745678901', idNumber: '45678901' },
    { firstName: 'David', lastName: 'Mwangi', email: 'david.mwangi@email.com', phone: '+254756789012', idNumber: '56789012' },
    { firstName: 'Jane', lastName: 'Njeri', email: 'jane.njeri@email.com', phone: '+254767890123', idNumber: '67890123' },
    { firstName: 'James', lastName: 'Otieno', email: 'james.otieno@email.com', phone: '+254778901234', idNumber: '78901234' },
    { firstName: 'Sarah', lastName: 'Chebet', email: 'sarah.chebet@email.com', phone: '+254789012345', idNumber: '89012345' },
    { firstName: 'Michael', lastName: 'Kipchoge', email: 'michael.kipchoge@email.com', phone: '+254790123456', idNumber: '90123456' },
    { firstName: 'Lucy', lastName: 'Wambui', email: 'lucy.wambui@email.com', phone: '+254701234567', idNumber: '01234567' },
    { firstName: 'Robert', lastName: 'Mutua', email: 'robert.mutua@email.com', phone: '+254712340001', idNumber: '12340001' },
    { firstName: 'Anne', lastName: 'Nyambura', email: 'anne.nyambura@email.com', phone: '+254723450002', idNumber: '23450002' },
    { firstName: 'Daniel', lastName: 'Kimani', email: 'daniel.kimani@email.com', phone: '+254734560003', idNumber: '34560003' },
    { firstName: 'Faith', lastName: 'Auma', email: 'faith.auma@email.com', phone: '+254745670004', idNumber: '45670004' },
    { firstName: 'Samuel', lastName: 'Kariuki', email: 'samuel.kariuki@email.com', phone: '+254756780005', idNumber: '56780005' },
    { firstName: 'Rebecca', lastName: 'Wairimu', email: 'rebecca.wairimu@email.com', phone: '+254767890006', idNumber: '67890006' },
    { firstName: 'Joseph', lastName: 'Omondi', email: 'joseph.omondi@email.com', phone: '+254778900007', idNumber: '78900007' },
    { firstName: 'Elizabeth', lastName: 'Chepkemoi', email: 'elizabeth.chepkemoi@email.com', phone: '+254789010008', idNumber: '89010008' },
    { firstName: 'Patrick', lastName: 'Wekesa', email: 'patrick.wekesa@email.com', phone: '+254790120009', idNumber: '90120009' },
    { firstName: 'Catherine', lastName: 'Muthoni', email: 'catherine.muthoni@email.com', phone: '+254701230010', idNumber: '01230010' },
  ];

  const tenants = [];
  for (const data of tenantData) {
    tenants.push(
      await prisma.tenant.create({
        data: {
          ...data,
          emergencyContact: data.phone.replace(/\d{3}$/, '999'),
          occupation: ['Engineer', 'Teacher', 'Accountant', 'Doctor', 'Lawyer', 'Manager'][Math.floor(Math.random() * 6)],
          employer: ['Tech Corp', 'Ministry of Education', 'ABC Company', 'Nairobi Hospital', 'Law Firm'][Math.floor(Math.random() * 5)],
          status: 'ACTIVE',
        },
      })
    );
  }

  console.log(`✅ Created ${tenants.length} tenants`);

  // Create Tenancies (only for occupied units)
  console.log('Creating tenancies...');
  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED');
  const tenancies = [];

  for (let i = 0; i < occupiedUnits.length && i < tenants.length; i++) {
    const unit = occupiedUnits[i];
    const tenant = tenants[i];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 12)); // Started 0-12 months ago

    // Calculate balance (some tenants are current, some in arrears)
    const monthsSinceStart = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const shouldOwe = i % 5 === 0; // 20% of tenants in arrears
    let balance = unit.depositAmount; // Start with deposit

    if (shouldOwe) {
      // In arrears: deposit + owe 1-3 months rent
      const monthsOwed = Math.floor(Math.random() * 3) + 1;
      balance = unit.depositAmount - unit.rentAmount * monthsOwed;
    } else {
      // Current or in credit
      const paymentsAhead = Math.floor(Math.random() * 2); // 0-1 months ahead
      balance = unit.depositAmount + unit.rentAmount * paymentsAhead;
    }

    tenancies.push(
      await prisma.tenancy.create({
        data: {
          tenantId: tenant.id,
          unitId: unit.id,
          startDate,
          rentAmount: unit.rentAmount,
          depositAmount: unit.depositAmount,
          rentDueDay: 5,
          leaseTerm: 'FIXED',
          balance,
          status: 'ACTIVE',
        },
      })
    );
  }

  console.log(`✅ Created ${tenancies.length} tenancies`);

  // Create Payments
  console.log('Creating payment history...');
  let paymentCount = 0;

  for (const tenancy of tenancies) {
    const monthsSinceStart = Math.floor((Date.now() - tenancy.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const paymentsToCreate = Math.min(monthsSinceStart + 1, 6); // Up to 6 months of payments

    // Create deposit payment
    await prisma.payment.create({
      data: {
        tenantId: tenancy.tenantId,
        amount: tenancy.depositAmount,
        paymentDate: tenancy.startDate,
        paymentMethod: 'MPESA',
        reference: `MPO${Math.random().toString().substring(2, 12)}`,
        notes: 'Security deposit',
      },
    });
    paymentCount++;

    // Create rent payments (skip some for tenants in arrears)
    for (let i = 1; i < paymentsToCreate; i++) {
      const shouldSkip = tenancy.balance < 0 && Math.random() > 0.5; // Skip some payments for those in arrears
      if (shouldSkip) continue;

      const paymentDate = new Date(tenancy.startDate);
      paymentDate.setMonth(paymentDate.getMonth() + i);
      paymentDate.setDate(Math.floor(Math.random() * 10) + 1); // Paid between 1st-10th

      await prisma.payment.create({
        data: {
          tenantId: tenancy.tenantId,
          amount: tenancy.rentAmount,
          paymentDate,
          paymentMethod: ['MPESA', 'BANK_TRANSFER', 'CASH'][Math.floor(Math.random() * 3)],
          reference: `${['MPO', 'REF', 'CASH'][Math.floor(Math.random() * 3)]}${Math.random().toString().substring(2, 12)}`,
          notes: `Rent payment for ${paymentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
        },
      });
      paymentCount++;
    }
  }

  console.log(`✅ Created ${paymentCount} payments`);

  // Create Invoices
  console.log('Creating invoices...');
  let invoiceCount = 0;

  for (const tenancy of tenancies) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Create invoice for current month
    const dueDate = new Date(currentYear, currentMonth, tenancy.rentDueDay);
    const isPaid = tenancy.balance >= 0;

    await prisma.invoice.create({
      data: {
        tenantId: tenancy.tenantId,
        amount: tenancy.rentAmount,
        dueDate,
        description: `Rent for ${today.toLocaleString('default', { month: 'long' })} ${currentYear}`,
        type: 'RENT',
        status: isPaid ? 'PAID' : dueDate < today ? 'OVERDUE' : 'PENDING',
      },
    });
    invoiceCount++;

    // Create previous month invoice if tenant has been there long enough
    if (tenancy.startDate < new Date(currentYear, currentMonth - 1, 1)) {
      const prevDueDate = new Date(currentYear, currentMonth - 1, tenancy.rentDueDay);
      await prisma.invoice.create({
        data: {
          tenantId: tenancy.tenantId,
          amount: tenancy.rentAmount,
          dueDate: prevDueDate,
          description: `Rent for ${prevDueDate.toLocaleString('default', { month: 'long' })} ${currentYear}`,
          type: 'RENT',
          status: 'PAID',
        },
      });
      invoiceCount++;
    }
  }

  console.log(`✅ Created ${invoiceCount} invoices`);

  // Summary
  console.log('\n🎉 Seed data created successfully!\n');
  console.log('📊 Summary:');
  console.log(`   - Properties: 3`);
  console.log(`   - Units: ${units.length} (${occupiedUnits.length} occupied, ${units.filter((u) => u.status === 'VACANT').length} vacant)`);
  console.log(`   - Tenants: ${tenants.length}`);
  console.log(`   - Active Tenancies: ${tenancies.length}`);
  console.log(`   - Payments: ${paymentCount}`);
  console.log(`   - Invoices: ${invoiceCount}`);
  console.log(`   - Tenants in Arrears: ${tenancies.filter((t) => t.balance < 0).length}`);
  console.log('\n👤 Demo User Credentials:');
  console.log('   Email: demo@propertym.com');
  console.log('   Password: Demo@123');
  console.log('\n🌐 Login at: http://localhost:3000\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

