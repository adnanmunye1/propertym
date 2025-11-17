import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadImage } from '../services/upload.service';
import {
  getUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  uploadUnitImage,
  deleteUnitImage,
} from '../controllers/unit.controller';

const router = Router();
router.use(authenticate);

// Unit routes
router.get('/', getUnits);
router.post('/', createUnit);
router.get('/:id', getUnitById);
router.patch('/:id', updateUnit);
router.delete('/:id', deleteUnit);

// Image routes
router.post('/:id/images', uploadImage.single('image'), uploadUnitImage);
router.delete('/:id/images/:imageId', deleteUnitImage);

export default router;

