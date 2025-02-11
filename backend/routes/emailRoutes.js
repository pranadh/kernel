import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getEmails, handleEmailWebhook } from '../controllers/emailController.js';

const router = express.Router();

router.get('/inbox', protect, getEmails);
router.post('/webhook', handleEmailWebhook);

export default router;