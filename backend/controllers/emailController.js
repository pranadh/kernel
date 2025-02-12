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

    // Extract correct message data
    const message = req.body.message || {};
    const headers = message.headers || {};
    const recipientEmail = headers.to || message.recipients?.[0];
    const senderEmail = headers.from || req.body***REMOVED***elope?.sender;

    // Handle attachments correctly from message object
    let attachments = [];
    if (message.attachments && Array.isArray(message.attachments)) {
      attachments = message.attachments.map(attachment => ({
        filename: attachment.filename,
        contentType: attachment['content-type'],
        size: attachment.size,
        url: req.body.storage?.url || null // Store Mailgun storage URL
      }));
    }

    // Create email record with proper data mapping
    const email = await Email.create({
      sender: senderEmail,
      recipient: recipientEmail,
      subject: headers.subject || '(No Subject)',
      bodyPlain: req.body['body-plain'] || req.body['stripped-text'],
      bodyHtml: req.body['body-html'] || req.body['stripped-html'],
      strippedText: req.body['stripped-text'],
      strippedHtml: req.body['stripped-html'],
      timestamp: new Date(Number(req.body.timestamp) * 1000),
      messageId: headers['message-id'],
      attachments: attachments,
      storage: req.body.storage // Store full storage info for reference
    });

    // Debug logging
    console.log('Email stored:', {
      emailId: email._id,
      sender: email.sender,
      recipient: email.recipient,
      subject: email.subject,
      attachmentCount: attachments.length,
      attachments: attachments
    });

    res.status(200).json({ message: 'Email stored successfully', data: email });
  } catch (error) {
    console.error('Webhook error:', error);
    console.error('Error details:', error.stack);
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