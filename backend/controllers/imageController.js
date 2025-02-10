import Image from '../models/Image.js';
import User from '../models/User.js';
import { promises as fs } from 'fs';
import sharp from 'sharp';
import path from 'path';

const UPLOAD_DIR = 'uploads/images';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = req.file.path;
    const fileSize = req.file.size;
    
    // Only compress if file is larger than 1MB and not a GIF
    if (fileSize > 1024 * 1024 && !req.file.mimetype.includes('gif')) {
      const compressedFilePath = path.join(
        path.dirname(filePath),
        `compressed_${req.file.filename}`
      );

      await sharp(filePath)
        .resize(2000, 2000, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toFile(compressedFilePath);

      // Replace original file with compressed version
      await fs.unlink(filePath);
      await fs.rename(compressedFilePath, filePath);
      
      // Update file size
      const stats = await fs.stat(filePath);
      req.file.size = stats.size;
    }

    const image = await Image.create({
      filename: req.file.filename,
      mimeType: req.file.mimetype, 
      size: req.file.size,
      author: req.user._id
    });

    const baseUrl = process***REMOVED***.NODE_ENV === 'production' 
      ? 'https://i.exlt.tech'
      : `${req.protocol}://i.${req.get('host')}`;

    res.status(201).json({
      url: `${baseUrl}/${image.imageId}`,
      deleteUrl: `https://exlt.tech/api/images/${image.imageId}`
    });
  } catch (error) {
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(400).json({ message: error.message });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const baseUrl = process***REMOVED***.NODE_ENV === 'production' 
      ? 'https://i.exlt.tech'
      : `${req.protocol}://i.${req.get('host')}`;

    const avatarUrl = `${baseUrl}/avatar/${req.file.filename}`;
    
    // Get user and their old avatar URL
    const user = await User.findById(req.user._id);
    const oldAvatarUrl = user.avatar;

    // Update user's avatar URL
    await User.findByIdAndUpdate(req.user._id, {
      avatar: avatarUrl
    });

    // Delete old avatar file if it exists
    await deleteOldFile(oldAvatarUrl);

    res.status(201).json({
      url: avatarUrl
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadBanner = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    if (req.file.mimetype === 'image/gif' && !req.user.isVerified) {
      return res.status(403).json({ message: "Only verified users can upload GIF banners" });
    }

    const baseUrl = process***REMOVED***.NODE_ENV === 'production' 
      ? 'https://i.exlt.tech'
      : `${req.protocol}://i.${req.get('host')}`;

    const bannerUrl = `${baseUrl}/banner/${req.file.filename}`;

    // Get user and their old banner URL
    const user = await User.findById(req.user._id);
    const oldBannerUrl = user.bannerImage;

    // Update user's banner URL
    await User.findByIdAndUpdate(req.user._id, {
      bannerImage: bannerUrl
    });

    // Delete old banner file if it exists
    await deleteOldFile(oldBannerUrl);

    res.status(201).json({
      url: bannerUrl
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getImage = async (req, res) => {
  try {
    const image = await Image.findOne({ imageId: req.params.id });
    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    const filePath = path.resolve('/var/www/kernel/backend/uploads/images', image.filename);
    
    // Debug logging
    console.log('Image request:', {
      imageId: req.params.id,
      filename: image.filename,
      filePath,
      mimeType: image.mimeType
    });

    // Verify file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.error('File access error:', error);
      return res.status(404).json({ message: "Image file not found" });
    }

    res.setHeader('Content-Type', image.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Send file
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Send file error:', err);
        res.status(500).json({ message: "Error sending file" });
      }
    });
  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const image = await Image.findOne({ 
      imageId: req.params.id,
      author: req.user._id 
    });
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const filePath = path.join(UPLOAD_DIR, image.filename);
    await fs.unlink(filePath);
    await Image.deleteOne({ _id: image._id });
    
    res.json({ message: "Image deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOldFile = async (url) => {
  if (!url) return;
  
  try {
    // Extract filename from URL
    const filename = url.split('/').pop();
    if (!filename) return;

    // Determine directory based on URL path
    const isAvatar = url.includes('/avatar/');
    const isBanner = url.includes('/banner/');
    const dir = isAvatar ? 'uploads/avatars' : 
                isBanner ? 'uploads/banners' : 
                'uploads/images';

    const filePath = path.join(dir, filename);
    await fs.unlink(filePath);
  } catch (error) {
    console.error('Failed to delete old file:', error);
  }
};

export const getUserImages = async (req, res) => {
  try {
    // First find the user by handle
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Then find their images
    const images = await Image.find({ author: user._id })
      .populate('author', 'username handle avatar isVerified')
      .sort({ createdAt: -1 });
      
    res.json(images);
  } catch (error) {
    console.error('Get user images error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllImages = async (req, res) => {
  try {
    const images = await Image.find({})
      .populate('author', 'username handle avatar isVerified')
      .sort({ createdAt: -1 })
      .limit(20);  // Limit to latest 20 images
    res.json(images);
  } catch (error) {
    console.error('Get all images error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getImageInfo = async (req, res) => {
  try {
    const image = await Image.findOne({ imageId: req.params.id })
      .populate('author', 'username handle avatar isVerified effects');
    
    if (!image) {
      return res.status(404).json({ message: "Image not found." });
    }

    res.json(image);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const adminDeleteImage = async (req, res) => {
  try {
    const image = await Image.findOne({ imageId: req.params.id });
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    const filePath = path.resolve('/var/www/kernel/backend/uploads/images', image.filename);
    
    // Delete file from server
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('File deletion error:', error);
    }

    // Delete from database
    await Image.deleteOne({ _id: image._id });
    
    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateImage = async (req, res) => {
  try {
    const { imageId: newImageId } = req.body;
    const currentImageId = req.params.imageId;

    // Input validation
    if (!newImageId) {
      return res.status(400).json({ message: "Image ID cannot be empty" });
    }

    if (newImageId.length > 8) {
      return res.status(400).json({ message: "Image ID cannot be longer than 8 characters" });
    }

    // Find the image
    const image = await Image.findOne({ imageId: currentImageId });
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Check ownership or admin status
    if (!req.user.roles.includes('admin') && image.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if new ID is already taken
    const existingImage = await Image.findOne({ imageId: newImageId });
    if (existingImage) {
      return res.status(400).json({ message: "This image ID is already taken" });
    }

    // Only verified users or admins can change image ID
    if (!req.user.isVerified && !req.user.roles.includes('admin')) {
      return res.status(403).json({ message: "Only verified users can edit image IDs" });
    }

    // Update the image ID
    image.imageId = newImageId;
    await image.save();

    // Return updated image with populated author
    const updatedImage = await Image.findById(image._id)
      .populate('author', 'username handle avatar isVerified');

    res.json(updatedImage);
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old avatar file if it exists
    if (user.avatar) {
      await deleteOldFile(user.avatar);
    }

    // Update user record
    user.avatar = null;
    await user.save();

    res.json({ message: "Avatar deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old banner file if it exists
    if (user.bannerImage) {
      await deleteOldFile(user.bannerImage);
    }

    // Update user record
    user.bannerImage = null;
    await user.save();

    res.json({ message: "Banner deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadIosImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const filePath = req.file.path;
    const fileSize = req.file.size;
    
    // Only compress if file is larger than 1MB and not a GIF
    if (fileSize > 1024 * 1024 && !req.file.mimetype.includes('gif')) {
      const compressedFilePath = path.join(
        path.dirname(filePath),
        `compressed_${req.file.filename}`
      );

      await sharp(filePath)
        .resize(2000, 2000, { // Max dimensions
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 }) // Adjust quality as needed
        .toFile(compressedFilePath);

      // Replace original file with compressed version
      await fs.unlink(filePath);
      await fs.rename(compressedFilePath, filePath);
      
      // Update file size in request object
      const stats = await fs.stat(filePath);
      req.file.size = stats.size;
    }

    const image = await Image.create({
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      author: req.user._id
    });

    const baseUrl = process***REMOVED***.NODE_ENV === 'production' 
      ? 'https://i.exlt.tech'
      : `${req.protocol}://i.${req.get('host')}`;

    res.status(201).json({
      url: `${baseUrl}/${image.imageId}`,
      deleteUrl: `https://exlt.tech/api/images/${image.imageId}`
    });

  } catch (error) {
    // Clean up file if exists
    if (req.file?.path) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    res.status(400).json({ message: error.message });
  }
};

export const cropImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const image = await Image.findOne({ imageId: req.params.imageId });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Verify ownership
    if (image.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const filePath = req.file.path;
    
    // Process and save the cropped image
    await sharp(filePath)
      .jpeg({ quality: 80 })
      .toFile(`uploads/images/${image.filename}`);

    // Cleanup temporary file
    await fs.unlink(filePath);

    res.json({ message: "Image cropped successfully" });
  } catch (error) {
    console.error('Crop error:', error);
    res.status(500).json({ message: error.message });
  }
};