import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing test data...');

  // Delete in correct order (respecting foreign keys)
  await prisma.payment.deleteMany({});
  console.log('✅ Deleted payments');

  await prisma.invoice.deleteMany({});
  console.log('✅ Deleted invoices');

  await prisma.document.deleteMany({});
  console.log('✅ Deleted documents');

  await prisma.tenancy.deleteMany({});
  console.log('✅ Deleted tenancies');

  await prisma.tenant.deleteMany({});
  console.log('✅ Deleted tenants');

  await prisma.unitImage.deleteMany({});
  await prisma.unit.deleteMany({});
  console.log('✅ Deleted units');

  await prisma.propertyImage.deleteMany({});
  await prisma.property.deleteMany({});
  console.log('✅ Deleted properties');

  // Optionally delete demo user
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@propertym.com' },
  });

  if (demoUser) {
    await prisma.user.delete({
      where: { email: 'demo@propertym.com' },
    });
    console.log('✅ Deleted demo user');
  }

  console.log('\n🎉 All test data cleared successfully!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error clearing test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

