import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadImage, getImage, deleteImage, getUserImages, getAllImages, getImageInfo, adminDeleteImage } from '../controllers/imageController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/images',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
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

router.get('/', protect, getAllImages);
router.get('/info/:id', protect, getImageInfo);
router.post('/', protect, upload.single('image'), uploadImage);
router.get('/:id', getImage);
router.delete('/:id', protect, deleteImage);
router.get('/user/images', protect, getUserImages);
router.delete('/:id', protect, admin, adminDeleteImage);

export default router;