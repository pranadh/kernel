import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getSystemStats } from '../controllers/adminController.js';

const router = express.Router();

router.get('/stats', protect, admin, getSystemStats);

export default router;