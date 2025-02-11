import FormData from "form-data";
import Mailgun from "mailgun.js";
import User from '../models/User.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
console.log('Environment check:', {
  apiKey: process***REMOVED***.MAILGUN_API_KEY ? 'Present' : 'Missing',
  domain: process***REMOVED***.MAILGUN_DOMAIN
});

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process***REMOVED***.MAILGUN_API_KEY,
  url: "https://api.mailgun.net/v3"
});

export const sendEmail = async (req, res) => {
  try {
    const { to, subject, text } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.hasEmail || !user.emailVerified) {
      return res.status(403).json({ message: "No email access" });
    }

    const data = await mg.messages.create("exlt.tech", {
      from: `${user.username} <${user.email}>`,
      to: to,
      subject: subject,
      text: text
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEmails = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.hasEmail || !user.emailVerified) {
      return res.status(403).json({ message: "No email access" });
    }

    const events = await mg.events.get("exlt.tech", {
      recipient: user.email
    });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};