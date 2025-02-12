import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true
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
    filename: String,
    contentType: String,
    size: Number,
    url: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Email', emailSchema);