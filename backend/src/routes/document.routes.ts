import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { uploadDocument } from '../services/upload.service';
import {
  getDocuments,
  getDocumentById,
  uploadDocument as uploadDoc,
  deleteDocument,
  getEntityDocuments,
} from '../controllers/document.controller';

const router = Router();
router.use(authenticate);

// Document routes
router.get('/', getDocuments);
router.post('/', uploadDocument.single('file'), uploadDoc);
router.get('/:id', getDocumentById);
router.delete('/:id', deleteDocument);
router.get('/:entityType/:entityId', getEntityDocuments);

export default router;

