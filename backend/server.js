import mongoose from 'mongoose';
import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';

// Load env first
dotenv.config();

const PORT = process***REMOVED***.PORT || 5000;

// Initialize express
const app = express();

// Create HTTP server
const server = createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ 
  server,
  path: '/ws', // Add specific path
  verifyClient: (info, cb) => {
    const token = new URL(info.req.url, 'https://exlt.tech').searchParams.get('token');
    if (!token) {
      cb(false, 401, 'Unauthorized');
      return;
    }
    try {
      const decoded = jwt.verify(token, process***REMOVED***.JWT_SECRET);
      info.req.user = decoded;
      cb(true);
    } catch (err) {
      cb(false, 401, 'Unauthorized');
    }
  }
});

// Store connected clients
export const clients = new Map();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const token = req.url.split('token=')[1];
  if (!token) {
    ws.close();
    return;
  }

  try {
    const decoded = jwt.verify(token, process***REMOVED***.JWT_SECRET);
    clients.set(decoded.id, ws);

    ws.on('close', () => {
      clients.delete(decoded.id);
    });
  } catch (error) {
    ws.close();
  }
});

// Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(cors({
  origin: ['http://localhost:5173', 'https://exlt.tech'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'],
  allowEIO3: true,
  transports: ['websocket']
}));

// Routes imports
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import imageRoutes from './routes/imageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import emailRoutes from './routes/emailRoutes.js';
import typingRoutes from './routes/typingRoutes.js';
import shortUrlRoutes from './routes/shortUrlRoutes.js';
import documentRoutes from "./routes/documentRoutes.js";
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

import { promises as fs } from 'fs';
import { cleanupOrphanedImages } from './utils/imageCleanup.js';
import { cleanupAttachments } from './controllers/emailController.js';

const ensureUploadDirs = async () => {
  try {
    await fs.mkdir('uploads/images', { recursive: true });
    await fs.mkdir('uploads/avatars', { recursive: true });
    await fs.mkdir('uploads/banners', { recursive: true });
    await fs.mkdir('uploads/attachments', { recursive: true }); // Add this line
  } catch (error) {
    console.error('Failed to create upload directories:', error);
    process.exit(1);
  }
};

app.use((req, res, next) => {
  if (req.subdomains[0] === 'i') {
    console.log('Image request:', {
      path: req.path,
      subdomain: req.subdomains[0],
      fullUrl: req.url
    });
    
    if (req.path.startsWith('/avatar/') || req.path.startsWith('/banner/')) {
      return next();
    }
    
    const imageId = req.path.substring(1);
    if (imageId) {
      req.url = `/api/images/${imageId}`;
    }
    return next();
  }
  next();
});

app.set('trust proxy', 1);

// Routes
app.use(apiLimiter);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/urls", shortUrlRoutes);
app.use("/api/images", imageRoutes);
app.use('/api/typing-scores', typingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stats", statsRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
app.use('/avatar', express.static('uploads/avatars'));
app.use('/banner', express.static('uploads/banners'));
app.use('/uploads/attachments', express.static('uploads/attachments'));

// Start server
try {
  const connection = await connectDB();
  app.locals.db = connection.connection; // Store connection in app.locals
  await ensureUploadDirs();
  
  setInterval(cleanupOrphanedImages, 24 * 60 * 60 * 1000);
  setInterval(cleanupAttachments, 24 * 60 * 60 * 1000);
  
  // Use server.listen instead of app.listen
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
} catch (error) {
  console.error('Server initialization failed:', error);
  process.exit(1);
}