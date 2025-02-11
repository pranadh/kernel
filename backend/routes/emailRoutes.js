import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getEmails, handleEmailWebhook, handleStoredEmail } from '../controllers/emailController.js';

const router = express.Router();

router.get('/inbox', protect, getEmails);
router.post('/webhook', handleEmailWebhook);
router.post('/store', handleStoredEmail);

export default router;