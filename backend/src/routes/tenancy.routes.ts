import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getTenancies,
  getTenancyById,
  moveIn,
  moveOut,
} from '../controllers/tenancy.controller';

const router = Router();
router.use(authenticate);

// Tenancy routes
router.get('/', getTenancies);
router.post('/move-in', moveIn);
router.patch('/:id/move-out', moveOut);
router.get('/:id', getTenancyById);

export default router;

