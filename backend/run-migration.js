// Run opening balance migration
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('🚀 Running opening balance migration...');
    
    // Check if column already exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'opening_balance'
    `;
    
    if (result.length > 0) {
      console.log('✅ Column opening_balance already exists!');
      return;
    }
    
    // Add the column
    await prisma.$executeRaw`
      ALTER TABLE tenants ADD COLUMN opening_balance DECIMAL(10,2)
    `;
    
    console.log('✅ Migration completed successfully!');
    console.log('The opening_balance column has been added to the tenants table.');
  } catch (error) {
    if (error.message.includes('already exists') || error.message.includes('duplicate')) {
      console.log('✅ Column opening_balance already exists!');
    } else {
      console.error('❌ Migration failed:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();

