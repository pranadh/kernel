import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendEmail, getEmails } from '../controllers/emailController.js';

const router = express.Router();

router.post('/send', protect, sendEmail);
router.get('/inbox', protect, getEmails);

export default router;