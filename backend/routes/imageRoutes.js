import express from 'express';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { 
  uploadImage, 
  getImage, 
  deleteImage, 
  getUserImages, 
  getAllImages, 
  getImageInfo, 
  adminDeleteImage, 
  updateImage,
  uploadAvatar,    // Add these
  uploadBanner     // Add these
} from '../controllers/imageController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.path.split('/')[1]; // 'avatar' or 'banner'
    const dir = type === 'avatar' ? 'uploads/avatars' : 
                type === 'banner' ? 'uploads/banners' : 
                'uploads/images';
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type'));
    }
    cb(null, true);
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ message: "File upload error" });
  }
  next(error);
});

router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/banner', protect, upload.single('banner'), uploadBanner);
router.post('/', protect, upload.single('image'), uploadImage);
router.get('/', protect, getAllImages);
router.delete('/avatar', protect, deleteAvatar);
router.delete('/banner', protect, deleteBanner);
router.get('/info/:id', protect, getImageInfo);
router.get('/:id', getImage);
router.delete('/:id', protect, deleteImage);
router.get('/user/:handle', protect, getUserImages);
router.delete('/:id', protect, admin, adminDeleteImage);
router.put('/:imageId', protect, updateImage);

export default router;