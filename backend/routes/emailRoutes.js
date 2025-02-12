import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { webhookLogger } from '../middleware/webhookLogger.js';
import { getEmails, handleEmailWebhook, starEmail } from '../controllers/emailController.js';

const router = express.Router();

// Configure multer for handling multipart form data
const upload = multer();

router.get('/inbox', protect, getEmails);
router.get('/sent', protect, getEmails);
router.get('/starred', protect, getEmails);
router.post('/webhook', 
  webhookLogger,
  upload.any(),
  async (req, res, next) => {
    try {
      if (!req.body || !req.body.message) {
        console.error('Invalid webhook payload:', req.body);
        return res.status(400).json({ message: 'Invalid webhook payload' });
      }
      next();
    } catch (error) {
      next(error);
    }
  },
  handleEmailWebhook
);
router.post('/:id/star', protect, starEmail);

export default router;