import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createShortUrl,
  getGlobalUrls, 
  getUserUrls,
  redirectToUrl,
  deleteUrl
} from '../controllers/shortUrlController.js';

const router = express.Router();

router.post('/', protect, createShortUrl);
router.get('/global', getGlobalUrls);
router.get('/me', protect, getUserUrls);
router.get('/:shortId', redirectToUrl);
router.delete('/:id', protect, deleteUrl);

export default router;