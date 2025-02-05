import { promises as fs } from 'fs';
import path from 'path';
import Image from '../models/Image.js';

export const cleanupOrphanedImages = async () => {
  try {
    const files = await fs.readdir('uploads/images');
    const dbImages = await Image.find({}, 'filename');
    const dbFilenames = new Set(dbImages.map(img => img.filename));
    
    for (const file of files) {
      if (!dbFilenames.has(file)) {
        await fs.unlink(path.join('uploads/images', file));
      }
    }
  } catch (error) {
    console.error('Image cleanup error:', error);
  }
};