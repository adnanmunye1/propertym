import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPayments,
  getPaymentById,
  createPayment,
  getTenantPayments,
  deletePayment,
} from '../controllers/payment.controller';

const router = Router();
router.use(authenticate);

// Payment routes
router.get('/', getPayments);
router.post('/', createPayment);
router.get('/tenant/:tenantId', getTenantPayments);
router.get('/:id', getPaymentById);
router.delete('/:id', deletePayment);

export default router;

