import Image from '../models/Image.js';
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
    const images = await Image.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    res.status(400).json({ message: error.message });
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