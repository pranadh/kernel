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
    console.log('Processing webhook payload:', JSON.stringify(req.body, null, 2));

    // Extract data from raw email fields
    const emailData = {
      sender: req.body.sender || req.body.from,
      recipient: req.body.recipient,
      subject: req.body.subject,
      bodyPlain: req.body['body-plain'],
      bodyHtml: req.body['body-html'],
      strippedText: req.body['stripped-text'],
      strippedHtml: req.body['stripped-html'],
      timestamp: new Date(Number(req.body.timestamp) * 1000),
      messageId: req.body['Message-Id'],
      attachments: []
    };

    // Handle attachments if present
    const attachmentCount = parseInt(req.body['attachment-count'] || 0);
    if (attachmentCount > 0) {
      // Create attachment array based on count
      emailData.attachments = Array.from({ length: attachmentCount }, (_, i) => {
        const index = i + 1;
        return {
          filename: req.body[`attachment-${index}`]?.name,
          contentType: req.body[`attachment-${index}`]?.['content-type'],
          size: req.body[`attachment-${index}`]?.size,
          url: req.body[`attachment-${index}`]?.url
        };
      });
    }

    console.log('Parsed email data:', emailData);

    // Create email record
    const email = await Email.create(emailData);

    console.log('Email stored successfully:', {
      id: email._id,
      attachments: email.attachments.length
    });

    res.status(200).json({ message: 'Email stored successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Error processing webhook',
      error: error.message 
    });
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