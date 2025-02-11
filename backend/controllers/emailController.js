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
    if (!user.hasEmail || !user.emailVerified) {
      return res.status(403).json({ message: "No email access" });
    }

    // Fetch emails from database
    const emails = await Email.find({ recipient: user.email })
      .sort({ timestamp: -1 })
      .limit(20);

    console.log('Retrieved emails:', emails);
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

    // Create email record
    const email = await Email.create({
      sender: req.body.sender,
      recipient: req.body.recipient,
      subject: req.body.subject,
      bodyPlain: req.body['body-plain'],
      bodyHtml: req.body['body-html'],
      strippedText: req.body['stripped-text'],
      strippedHtml: req.body['stripped-html'],
      timestamp: new Date(Number(req.body.timestamp) * 1000),
      messageId: req.body['Message-Id']
    });

    console.log('Stored email:', email);
    res.status(200).json({ 
      message: 'Email stored successfully',
      data: email 
    });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};