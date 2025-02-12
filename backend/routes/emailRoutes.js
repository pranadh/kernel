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
  express.json({
    limit: '50mb' // Increase limit to handle larger payloads
  }),
  webhookLogger,
  async (req, res, next) => {
    try {
      // Log the incoming webhook data
      console.log('Webhook payload:', JSON.stringify(req.body, null, 2));

      if (!req.body) {
        console.error('Empty webhook payload');
        return res.status(400).json({ message: 'Empty webhook payload' });
      }

      next();
    } catch (error) {
      console.error('Webhook middleware error:', error);
      next(error);
    }
  },
  handleEmailWebhook
);
router.post('/:id/star', protect, starEmail);

export default router;