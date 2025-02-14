import express from 'express';
import { protect, admin, controlAccess } from '../middleware/authMiddleware.js';
import { 
  getSpotifyAuth, 
  handleCallback, 
  addToQueue,
  getCurrentTrack,
  getQueuedTracks,
  adjustVolume,
  controlPlayback,
  getRecentlyPlayed,
  getSpotifyProfile
} from '../controllers/spotifyController.js';

const router = express.Router();

// Admin routes
router.get('/auth', protect, admin, getSpotifyAuth);
router.get('/callback', handleCallback);

// Public endpoints
router.get('/profile', getSpotifyProfile);
router.get('/current', getCurrentTrack);
router.get('/queued', getQueuedTracks);
router.post('/queue', protect, addToQueue);
router.put('/volume', protect, controlAccess('dj'), adjustVolume);
router.post('/playback', protect, controlAccess('dj'), controlPlayback);
router.get('/recent', getRecentlyPlayed);

export default router;