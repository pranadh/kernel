import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  getSpotifyAuth, 
  handleCallback, 
  addToQueue,
  getCurrentTrack,
  getQueuedTracks
} from '../controllers/spotifyController.js';

const router = express.Router();

// Admin routes (protected)
router.get('/auth', protect, admin, getSpotifyAuth);
router.get('/callback', handleCallback);

// Public routes
router.get('/current', getCurrentTrack);
router.get('/queued', getQueuedTracks);
router.post('/queue', addToQueue);

export default router;