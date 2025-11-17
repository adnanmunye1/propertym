import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getPaymentsReport,
  getArrearsReport,
  getOccupancyReport,
  exportReport,
} from '../controllers/report.controller';

const router = Router();
router.use(authenticate);

// Report routes
router.get('/payments', getPaymentsReport);
router.get('/arrears', getArrearsReport);
router.get('/occupancy', getOccupancyReport);
router.get('/export/:type', exportReport);

export default router;

