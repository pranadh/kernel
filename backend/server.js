import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

dotenv.config();
connectDB();

const app = express();

// Increase payload size limit (50MB)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(apiLimiter);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/documents", documentRoutes);

const PORT = process***REMOVED***.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));