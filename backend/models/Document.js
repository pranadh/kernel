import mongoose from "mongoose";
import generateId from '../utils/generateId.js';

const documentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    unique: true,
    required: true,
    default: () => generateId(7)
  },
  title: {
    type: String,
    default: 'Untitled Document'
  },
  content: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure documentId uniqueness
documentSchema.index({ documentId: 1 }, { unique: true });

export default mongoose.model('Document', documentSchema);