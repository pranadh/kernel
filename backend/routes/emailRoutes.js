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
router.post('/:emailId/star', protect, starEmail);
router.post('/webhook', 
  upload.any(), // Handle multipart form data
  webhookLogger,
  async (req, res, next) => {
    try {
      // Convert multipart form data to JSON structure
      const formData = {};
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          formData[key] = req.body[key];
        });
      }
      
      // Handle file attachments if present
      if (req.files && req.files.length > 0) {
        formData['attachment-count'] = req.files.length;
        req.files.forEach((file, index) => {
          formData[`attachment-${index + 1}`] = {
            name: file.originalname,
            'content-type': file.mimetype,
            size: file.size,
            url: file.path // You'll need to store this somewhere and generate a URL
          };
        });
      }

      // Attach the processed data to req.body
      req.body = formData;

      console.log('Processed webhook data:', JSON.stringify(formData, null, 2));
      next();
    } catch (error) {
      console.error('Webhook middleware error:', error);
      next(error);
    }
  },
  handleEmailWebhook
);

export default router;