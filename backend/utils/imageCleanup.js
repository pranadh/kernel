import { promises as fs } from 'fs';
import path from 'path';
import Image from '../models/Image.js';
import User from '../models/User.js';

export const cleanupOrphanedImages = async () => {
  try {
    // Regular images cleanup
    const files = await fs.readdir('uploads/images');
    const dbImages = await Image.find({}, 'filename');
    const dbFilenames = new Set(dbImages.map(img => img.filename));
    
    for (const file of files) {
      if (!dbFilenames.has(file)) {
        await fs.unlink(path.join('uploads/images', file));
      }
    }

    // Avatar cleanup
    const avatarFiles = await fs.readdir('uploads/avatars');
    const users = await User.find({}, 'avatar');
    const avatarFilenames = new Set(users
      .map(u => u.avatar?.split('/').pop())
      .filter(Boolean));

    for (const file of avatarFiles) {
      if (!avatarFilenames.has(file)) {
        await fs.unlink(path.join('uploads/avatars', file));
      }
    }

    // Banner cleanup
    const bannerFiles = await fs.readdir('uploads/banners');
    const bannerFilenames = new Set(users
      .map(u => u.bannerImage?.split('/').pop())
      .filter(Boolean));

    for (const file of bannerFiles) {
      if (!bannerFilenames.has(file)) {
        await fs.unlink(path.join('uploads/banners', file));
      }
    }
  } catch (error) {
    console.error('Image cleanup error:', error);
  }
};