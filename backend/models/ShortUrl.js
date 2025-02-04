import mongoose from "mongoose";
import generateId from '../utils/generateId.js';

const shortUrlSchema = new mongoose.Schema({
  shortId: {
    type: String,
    unique: true,
    required: true,
    default: () => generateId(7)
  },
  originalUrl: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000),
    index: { expires: 0 }
  }
}, {
  timestamps: true
});

export default mongoose.model('ShortUrl', shortUrlSchema);