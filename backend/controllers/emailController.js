import FormData from "form-data";
import Mailgun from "mailgun.js";
import User from '../models/User.js';
import Email from '../models/Email.js';
import dotenv from 'dotenv';

dotenv.config();

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process***REMOVED***.MAILGUN_API_KEY,
  url: "https://api.mailgun.net/v3"
});

// Get emails from database
export const getEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build query based on active view
    let query = { timestamp: { $exists: true } };
    
    switch (req.path) {
      case '/starred':
        query.starred = true;
        query.recipient = user.email;
        break;
      case '/sent':
        query.sender = user.email;
        break;
      case '/inbox':
      default:
        query.recipient = user.email;
        break;
    }

    console.log('Searching for emails with query:', query);

    const emails = await Email.find(query)
      .sort({ timestamp: -1 })
      .limit(20)
      .lean();

    console.log(`Found ${emails.length} emails for view: ${req.path}`);
    
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: error.message });
  }
};

// Handle incoming email webhooks
export const handleEmailWebhook = async (req, res) => {
  try {
    console.log('Webhook payload received:', req.body);

    // Debug log to see full attachment data
    console.log('Attachment data:', {
      attachmentCount: req.body['attachment-count'],
      attachmentInfo: req.body['attachments'],
      contentType: req.body['Content-Type'],
      files: req.files
    });

    // Handle attachments - Mailgun sends them as part of the multipart form data
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files
        .filter(file => !file.fieldname.startsWith('inline-image-')) // Filter out inline images
        .map(file => ({
          filename: file.originalname,
          contentType: file.mimetype,
          size: file.size,
          url: file.location || null, // If using S3 or similar storage
          data: file.buffer // Store the actual file data
        }));
    }

    // Create email record with attachments
    const email = await Email.create({
      sender: req.body.sender,
      recipient: req.body.recipient,
      subject: req.body.subject,
      bodyPlain: req.body['body-plain'] || req.body['stripped-text'],
      bodyHtml: req.body['body-html'] || req.body['stripped-html'],
      strippedText: req.body['stripped-text'],
      strippedHtml: req.body['stripped-html'],
      timestamp: new Date(Number(req.body.timestamp) * 1000),
      messageId: req.body['Message-Id'],
      attachments: attachments
    });

    console.log('Email stored with attachments:', {
      emailId: email._id,
      attachmentCount: attachments.length,
      attachments: attachments.map(a => ({
        filename: a.filename,
        size: a.size,
        type: a.contentType
      }))
    });

    res.status(200).json({ message: 'Email stored successfully', data: email });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const starEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    
    const email = await Email.findByIdAndUpdate(
      id,
      { starred },
      { new: true }
    );

    if (!email) {
      return res.status(404).json({ message: "Email not found" });
    }

    res.json(email);
  } catch (error) {
    console.error('Error starring email:', error);
    res.status(500).json({ message: error.message });
  }
};