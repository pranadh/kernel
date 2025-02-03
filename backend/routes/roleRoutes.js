import express from "express";
import { assignRole, getRoles } from "../controllers/roleController.js";
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post("/assign", protect, admin, assignRole);
router.get("/list", protect, getRoles);

export default router;