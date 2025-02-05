// Image.js
import mongoose from "mongoose";
import generateId from '../utils/generateId.js';

const imageSchema = new mongoose.Schema({
  imageId: {
    type: String,
    unique: true,
    required: true,
    default: () => generateId(5)
  },
  filename: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Image', imageSchema);