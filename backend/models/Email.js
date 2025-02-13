import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    default: ''
  },
  recipient: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: '(No Subject)'
  },
  bodyPlain: String,
  bodyHtml: String,
  strippedText: String,
  strippedHtml: String,
  timestamp: {
    type: Date,
    required: true,
    default: Date.now
  },
  starred: {
    type: Boolean,
    default: false
  },
  messageId: String,
  attachments: [{
    filename: String, // Stored filename
    originalName: String, // Original filename
    contentType: String,
    size: Number,
    path: String // Server path
  }]
}, {
  timestamps: true
});

export default mongoose.model('Email', emailSchema);