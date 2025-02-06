import Image from '../models/Image.js';
import User from '../models/User.js';
import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = 'uploads/images';

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const image = await Image.create({
      filename: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      author: req.user._id
    });

    // Fix URL construction
    const baseUrl = process***REMOVED***.NODE_ENV === 'production' 
      ? 'https://i.exlt.tech'
      : `${req.protocol}://i.${req.get('host')}`;

    res.status(201).json({
      url: `${baseUrl}/${image.imageId}`,
      deleteUrl: `https://exlt.tech/api/images/${image.imageId}`
    });
  } catch (error) {
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

    // Update user's avatar URL with correct path
    const avatarUrl = `${baseUrl}/avatar/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user._id, {
      avatar: avatarUrl
    });

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

    // Verify GIF permissions
    if (req.file.mimetype === 'image/gif' && !req.user.isVerified) {
      return res.status(403).json({ message: "Only verified users can upload GIF banners" });
    }

    const baseUrl = process***REMOVED***.NODE_ENV === 'production' 
      ? 'https://i.exlt.tech'
      : `${req.protocol}://i.${req.get('host')}`;

    // Update user's banner URL
    await User.findByIdAndUpdate(req.user._id, {
      bannerImage: `${baseUrl}/banner/${req.file.filename}`
    });

    res.status(201).json({
      url: `${baseUrl}/banner/${req.file.filename}`
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getImage = async (req, res) => {
  try {
    const image = await Image.findOne({ imageId: req.params.id });
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
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

    // Set proper headers
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
      .populate('author', 'username handle avatar isVerified');
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
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