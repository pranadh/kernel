import express from 'express';
import { getPlatformStats } from '../controllers/statsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getPlatformStats);

export default router;