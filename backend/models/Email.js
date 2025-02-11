import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  subject: String,
  bodyPlain: { type: String, alias: 'body-plain' },
  bodyHtml: { type: String, alias: 'body-html' },
  strippedText: { type: String, alias: 'stripped-text' },
  strippedHtml: { type: String, alias: 'stripped-html' },
  timestamp: Date,
  messageId: String
}, { timestamps: true });

export default mongoose.model('Email', emailSchema);