import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { getEmails, handleEmailWebhook, starEmail } from '../controllers/emailController.js';

const router = express.Router();

// Configure multer for handling multipart form data
const upload = multer();

router.get('/inbox', protect, getEmails);
router.get('/sent', protect, getEmails);
router.get('/starred', protect, getEmails);
router.post('/webhook', upload.any(), handleEmailWebhook);  // Add multer middleware
router.post('/:id/star', protect, starEmail);

export default router;