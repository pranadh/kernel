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
    origin: ['http://localhost:5173', 'https://exlt.tech', 'https://www.exlt.tech'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes imports
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import { apiLimiter } from './middleware/rateLimitMiddleware.js';

// Routes
app.use(apiLimiter);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/documents", documentRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Start server
try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
} catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
}