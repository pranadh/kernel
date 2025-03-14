import FormData from "form-data";
import Mailgun from "mailgun.js";
import User from '../models/User.js';
import Email from '../models/Email.js';
import { clients } from '../server.js';
import dotenv from 'dotenv';

dotenv.config();

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
  url: "https://api.mailgun.net"
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
        query.$or = [
          { recipient: user.email },
          { sender: user.email }
        ];
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
      .limit(200)
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

    // Check for duplicate message first
    const messageId = req.body['Message-Id'] || req.body['message-id'];
    const existingEmail = await Email.findOne({ messageId });
    
    if (existingEmail) {
      console.log('Duplicate email detected, skipping:', messageId);
      return res.status(200).json({ 
        message: 'Duplicate email skipped',
        existing: existingEmail._id 
      });
    }

    // Parse sender name and email
    let senderName = '';
    let senderEmail = '';
    
    const fromHeader = req.body.from || req.body.sender || '';
    const fromMatch = fromHeader.match(/^(?:"?([^"<]*)"?\s*)?(?:<(.+)>)?$/);
    
    if (fromMatch) {
      senderName = (fromMatch[1] || '').trim().replace(/^"|"$/g, ''); // Remove quotes
      senderEmail = (fromMatch[2] || fromMatch[0]).trim();
    } else {
      senderEmail = fromHeader;
    }
    
    // Extract data from form fields
    const emailData = {
      sender: senderEmail,
      senderName: senderName,
      recipient: req.body.recipient || req.body.to || req.body['to'],
      subject: req.body.subject || '(No Subject)',
      bodyPlain: req.body['body-plain'] || req.body.text,
      bodyHtml: req.body['body-html'] || req.body.html,
      strippedText: req.body['stripped-text'],
      strippedHtml: req.body['stripped-html'],
      timestamp: req.body.timestamp ? new Date(Number(req.body.timestamp) * 1000) : new Date(),
      messageId: req.body['Message-Id'] || req.body['message-id'],
      attachments: []
    };

    // Handle attachments from multipart form data
    const attachmentCount = parseInt(req.body['attachment-count'] || 0);
    if (attachmentCount > 0) {
      emailData.attachments = Array.from({ length: attachmentCount }, (_, i) => {
        const attachment = req.body[`attachment-${i + 1}`];
        return {
          filename: attachment?.name,
          contentType: attachment?.['content-type'],
          size: attachment?.size,
          url: attachment?.url
        };
      }).filter(att => att.filename); // Filter out incomplete attachments
    }

    console.log('Parsed email data:', emailData);

    // Create email record
    const email = await Email.create(emailData);

    const user = await User.findOne({ email: emailData.recipient });
    if (user) {
      const ws = clients.get(user._id.toString());
      if (ws) {
        ws.send(JSON.stringify({ 
          type: 'EMAIL_UPDATE',
          email: email
        }));
      }
    }

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
    const { emailId } = req.params;
    const { starred } = req.body;
    
    const email = await Email.findByIdAndUpdate(
      emailId,
      { starred },
      { new: true }
    );

    if (!email) {
      return res.status(404).json({ message: 'Email not found' });
    }

    res.json({ success: true, email });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update email' });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;
    const attachments = req.files || [];

    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({
        message: 'Missing required fields: to, subject, and either html or text'
      });
    }

    // Format the "From" field using username and email
    const fromField = `${req.user.username} <${req.user.email}>`;

    // Create message data object
    const messageData = {
      from: fromField,
      to: to,
      subject: subject,
      html: html || undefined,
      text: text || undefined
    };

    // Handle attachments properly
    if (attachments.length > 0) {
      messageData.attachment = attachments.map(file => ({
        data: file.buffer,
        filename: file.originalname,
        contentType: file.mimetype
      }));
    }

    // Send via Mailgun
    const response = await mg.messages.create(
      process.env.MAILGUN_DOMAIN,
      messageData
    );

    // Store sent email in database with proper sender info
    const emailData = {
      sender: req.user.email,
      senderName: req.user.name || '',
      recipient: to,
      subject: subject,
      bodyHtml: html,
      bodyPlain: text,
      timestamp: new Date(),
      messageId: response.id,
      attachments: attachments.map(file => ({
        filename: file.originalname,
        contentType: file.mimetype,
        size: file.size
      }))
    };

    const email = await Email.create(emailData);

    // Send success response
    res.json({
      success: true,
      messageId: response.id,
      email: email
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message,
      details: error.details || error.response?.data
    });
  }
};