import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadImage } from '../services/upload.service';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImage,
  deletePropertyImage,
  getPropertyStats,
} from '../controllers/property.controller';

const router = Router();

// All property routes require authentication
router.use(authenticate);

// Property routes
router.get('/', getProperties);
router.post('/', createProperty);
router.get('/:id', getPropertyById);
router.patch('/:id', updateProperty);
router.delete('/:id', deleteProperty);
router.get('/:id/stats', getPropertyStats);

// Image routes
router.post('/:id/images', uploadImage.single('image'), uploadPropertyImage);
router.delete('/:id/images/:imageId', deletePropertyImage);

export default router;

