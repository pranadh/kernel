import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendEmail, getEmails, handleEmailWebhook } from '../controllers/emailController.js';
import { webhookLogger } from '../middleware/webhookLogger.js';

const router = express.Router();

router.post('/send', protect, sendEmail);
router.get('/inbox', protect, getEmails);
router.post('/webhook', webhookLogger, handleEmailWebhook);

export default router;