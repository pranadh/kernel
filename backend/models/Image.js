// Image.js
import mongoose from "mongoose";
import generateId from '../utils/generateId.js';

const imageSchema = new mongoose.Schema({
  imageId: {
    type: String,
    unique: true,
    required: true,
    default: () => generateId(7)
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
  }
}, {
  timestamps: true
});

export default mongoose.model('Image', imageSchema);