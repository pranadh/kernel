import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load env first
dotenv.config();

const PORT = process***REMOVED***.PORT || 5000;

// Initialize express
const app = express();

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(cors({
    origin: ['http://localhost:5173', 'https://exlt.tech', 'https://www.exlt.tech', 'https://i.exlt.tech'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes imports
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import imageRoutes from './routes/imageRoutes.js';
import shortUrlRoutes from './routes/shortUrlRoutes.js';
import documentRoutes from "./routes/documentRoutes.js";
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

import { promises as fs } from 'fs';
import { cleanupOrphanedImages } from './utils/imageCleanup.js';

const ensureUploadDir = async () => {
  try {
    await fs.mkdir('uploads/images', { recursive: true });
  } catch (error) {
    console.error('Failed to create upload directory:', error);
    process.exit(1);
  }
};

// Routes
app.use(apiLimiter);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/urls", shortUrlRoutes);
app.use("/api/images", imageRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use((req, res, next) => {
  if (req.subdomains[0] === 'i') {
    const imageId = req.path.substring(1); // Remove leading slash
    if (imageId) {
      req.url = `/api/images/${imageId}`;
      return next();
    }
  }
  next();
});

// Start server
try {
  await connectDB();
  await ensureUploadDir();
  
  // Run cleanup every 24 hours
  setInterval(cleanupOrphanedImages, 24 * 60 * 60 * 1000);
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Server initialization failed:', error);
  process.exit(1);
}