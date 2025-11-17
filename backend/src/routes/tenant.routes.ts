import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTenants,
  getTenantById,
  createTenant,
  updateTenant,
  getTenantBalance,
} from '../controllers/tenant.controller';

const router = Router();
router.use(authenticate);

// Tenant routes
router.get('/', getTenants);
router.post('/', createTenant);
router.get('/:id', getTenantById);
router.patch('/:id', updateTenant);
router.get('/:id/balance', getTenantBalance);

export default router;

