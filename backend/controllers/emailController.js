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

console.log('Mailgun client initialized with domain:', process***REMOVED***.MAILGUN_DOMAIN);

export const getEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.hasEmail || !user.emailVerified) {
      return res.status(403).json({ message: "No email access" });
    }

    // Use events API to retrieve messages
    const messages = await mg.events.get(process***REMOVED***.MAILGUN_DOMAIN, {
      event: ['stored', 'delivered'],
      recipient: user.email,
      limit: 20,
      ascending: 'yes'
    });

    console.log('Fetched messages:', messages);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ message: error.message });
  }
};

export const handleEmailWebhook = async (req, res) => {
  try {
    console.log('Webhook payload:', req.body);

    // Handle Mailgun test event
    if (req.body.event === 'test') {
      return res.status(200).json({ message: 'Webhook test successful' });
    }

    // Check if signature exists before verifying
    if (!req.body.signature) {
      console.log('No signature found in webhook payload');
      return res.status(401).json({ message: 'No signature provided' });
    }

    // Verify webhook signature
    const verified = mg.webhooks.verify(
      req.body.signature.timestamp,
      req.body.signature.token,
      req.body.signature.signature,
      process***REMOVED***.MAILGUN_WEBHOOK_SIGNING_KEY
    );

    if (!verified) {
      console.log('Invalid webhook signature');
      return res.status(401).json({ message: 'Invalid webhook signature' });
    }

    // Use bracket notation to access event-data
    const eventData = req.body['event-data'];
    console.log('Webhook event data:', eventData);

    if (eventData && eventData.recipient) {
      // Find user by email address
      const user = await User.findOne({ 
        email: eventData.recipient,
        hasEmail: true,
        emailVerified: true 
      });

      if (!user) {
        console.log('No user found for email:', eventData.recipient);
        return res.status(404).json({ message: 'No user found for this email' });
      }

      console.log('Processing email for user:', user.username);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const sendEmail = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.hasEmail || !user.emailVerified) {
      return res.status(403).json({ message: "No email access" });
    }

    const { to, subject, text } = req.body;

    const data = await mg.messages.create(process***REMOVED***.MAILGUN_DOMAIN, {
      from: `${user.username} <${user.email}>`,
      to: to,
      subject: subject,
      text: text
    });

    res.json(data);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: error.message });
  }
};