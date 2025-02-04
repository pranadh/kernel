import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  createDocument, 
  getUserDocuments, 
  getDocument, 
  updateDocument,
  deleteDocument,
  incrementViewCount,
  getGlobalDocuments,
  searchDocuments,
  getAllDocuments
} from '../controllers/documentController.js';

const router = express.Router();

router.get('/all', protect, admin, getAllDocuments);
router.post('/', protect, createDocument);
router.get('/me', protect, getUserDocuments);
router.get('/global', getGlobalDocuments);
router.get('/search', searchDocuments);
router.get('/:id', getDocument);
router.delete('/:id', protect, deleteDocument);
router.put('/:id', protect, updateDocument);
router.post('/:id/view', incrementViewCount);

export default router;