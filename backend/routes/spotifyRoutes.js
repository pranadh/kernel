import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getSpotifyAuth, 
  handleCallback, 
  addToQueue,
  getCurrentTrack,
  getQueuedTracks,
  searchTracks
} from '../controllers/spotifyController.js';

const router = express.Router();

router.get('/auth', protect, getSpotifyAuth);
router.get('/callback', handleCallback);
router.get('/search', protect, searchTracks);
router.post('/queue', protect, addToQueue);
router.get('/current', getCurrentTrack);
router.get('/queued', getQueuedTracks);

export default router;