import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  generateInvoices,
  getTenantInvoices,
} from '../controllers/invoice.controller';

const router = Router();
router.use(authenticate);

// Invoice routes
router.get('/', getInvoices);
router.post('/', createInvoice);
router.post('/generate', generateInvoices);
router.get('/tenant/:tenantId', getTenantInvoices);
router.get('/:id', getInvoiceById);

export default router;

