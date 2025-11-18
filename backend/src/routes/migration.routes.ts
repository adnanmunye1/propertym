import { Router } from 'express';
import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { authenticateToken } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils/response';

const router = Router();

/**
 * One-time migration endpoint to add opening_balance column
 * This should be called once and then the route can be removed
 */
router.post('/add-opening-balance-column', authenticateToken, async (req: Request, res: Response) => {
  try {
    // Check if column already exists
    const result = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tenants' 
      AND column_name = 'opening_balance'
    `;
    
    if (result.length > 0) {
      return successResponse(res, { message: 'Column already exists' }, 'Column opening_balance already exists');
    }
    
    // Add the column
    await prisma.$executeRaw`
      ALTER TABLE tenants ADD COLUMN opening_balance DECIMAL(10,2)
    `;
    
    return successResponse(res, { message: 'Migration completed' }, 'Opening balance column added successfully');
  } catch (error: any) {
    if (error.message?.includes('already exists') || error.message?.includes('duplicate')) {
      return successResponse(res, { message: 'Column already exists' }, 'Column opening_balance already exists');
    }
    return errorResponse(res, error.message || 'Migration failed', 'MIGRATION_ERROR', 500);
  }
});

export default router;

