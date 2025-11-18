// Simple script to add opening_balance column
// Run with: node add-opening-balance.js
// Make sure DATABASE_URL is set in environment

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addColumn() {
  try {
    console.log('🚀 Adding opening_balance column to tenants table...');
    
    // Check if column exists
    const checkResult = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'opening_balance'
    `;
    
    if (checkResult.length > 0) {
      console.log('✅ Column opening_balance already exists!');
      return;
    }
    
    // Add the column
    await prisma.$executeRaw`
      ALTER TABLE tenants ADD COLUMN opening_balance DECIMAL(10,2)
    `;
    
    console.log('✅ Successfully added opening_balance column to tenants table!');
  } catch (error) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      console.log('✅ Column opening_balance already exists!');
    } else {
      console.error('❌ Error:', error.message);
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addColumn();

