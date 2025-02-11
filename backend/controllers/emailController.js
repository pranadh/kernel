import FormData from "form-data";
import Mailgun from "mailgun.js";
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process***REMOVED***.MAILGUN_API_KEY,
  url: "https://api.mailgun.net/v3"
});

// Get emails from Mailgun storage
export const getEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.hasEmail || !user.emailVerified) {
      return res.status(403).json({ message: "No email access" });
    }

    // Using the correct method to get stored messages
    const events = await mg.events.get(process***REMOVED***.MAILGUN_DOMAIN, {
      event: 'stored',
      limit: 20,
      ascending: 'no'
    });

    console.log('Retrieved events:', events);
    res.json(events);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: error.message });
  }
};

// Handle incoming email webhooks
export const handleEmailWebhook = async (req, res) => {
  try {
    console.log('Webhook payload received:', req.body);

    // Verify webhook signature
    const verified = true; // Implement proper signature verification if needed

    if (!verified) {
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    // The incoming email data structure typically includes:
    const emailData = {
      sender: req.body.sender,
      recipient: req.body.recipient,
      subject: req.body.subject,
      'body-plain': req.body['body-plain'],
      'body-html': req.body['body-html'],
      'stripped-text': req.body['stripped-text'],
      'stripped-html': req.body['stripped-html'],
      attachments: req.body.attachments,
      timestamp: req.body.timestamp,
      signature: req.body.signature,
      'message-headers': req.body['message-headers'],
      'content-id-map': req.body['content-id-map']
    };

    console.log('Processed email data:', emailData);
    res.status(200).json({ 
      message: 'Email processed successfully',
      data: emailData 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const handleStoredEmail = async (req, res) => {
  try {
    console.log('=== Stored Email Contents ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Timestamp:', new Date().toISOString());
    console.log('========================');

    // Create a structured log for easier reading
    const storedEmail = {
      timestamp: new Date(),
      sender: req.body.sender,
      recipient: req.body.recipient,
      subject: req.body.subject,
      'body-plain': req.body['body-plain'],
      'body-html': req.body['body-html'],
      attachments: req.body.attachments
    };

    // Log the structured data
    console.log('Stored Email Data:', JSON.stringify(storedEmail, null, 2));

    // Send success response
    res.status(200).json({ message: 'Email storage received' });
  } catch (error) {
    console.error('Storage webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};