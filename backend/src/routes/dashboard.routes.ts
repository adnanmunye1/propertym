import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { successResponse } from '../utils/response';
import { calculateDashboardMetrics, getTenantsWithArrears } from '../services/arrears.service';

const router = Router();
router.use(authenticate);

router.get('/metrics', async (_req, res, next) => {
  try {
    const metrics = await calculateDashboardMetrics();
    successResponse(res, metrics);
  } catch (error) {
    next(error);
  }
});

router.get('/arrears', async (_req, res, next) => {
  try {
    const arrears = await getTenantsWithArrears();
    successResponse(res, arrears);
  } catch (error) {
    next(error);
  }
});

export default router;

