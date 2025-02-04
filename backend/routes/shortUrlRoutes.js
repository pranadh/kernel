import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  createShortUrl,
  getGlobalUrls, 
  getUserUrls,
  redirectToUrl,
  deleteUrl,
  getOneUserUrls,
  getAllUrls,
  updateUrl,
  renewUrl,
  getUrlInfo
} from '../controllers/shortUrlController.js';

const router = express.Router();

router.post('/', protect, createShortUrl);
router.get('/global', getGlobalUrls);
router.get('/me', protect, getUserUrls);
router.get('/all', protect, admin, getAllUrls);
router.get('/:shortId', redirectToUrl);
router.get('/user/:handle', getOneUserUrls);
router.delete('/:id', protect, deleteUrl);
router.put('/:id', protect, updateUrl);
router.post('/:id/renew', protect, renewUrl);
router.get('/info/:shortId', protect, getUrlInfo);

export default router;