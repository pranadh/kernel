import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createDocument, 
  getUserDocuments, 
  getDocument, 
  updateDocument,
  deleteDocument,
  incrementViewCount,
  getGlobalDocuments,
  searchDocuments
} from '../controllers/documentController.js';

const router = express.Router();

router.post('/', protect, createDocument);
router.get('/me', protect, getUserDocuments);
router.get('/global', getGlobalDocuments);
router.get('/search', searchDocuments);
router.get('/:id', getDocument);
router.delete('/:id', protect, deleteDocument);
router.put('/:id', protect, updateDocument);
router.post('/:id/view', incrementViewCount);

export default router;