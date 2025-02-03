import express from "express";
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getAllUsers,
  getCurrentUser,
  addRole,
  removeRole,
  updateUserRoles,
  verifyUser,
  followUser,
  getFollowers,
  getFollowing,
  updateProfile,
  getUserDocuments
} from "../controllers/userController.js";
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", protect, getCurrentUser);
router.get("/all", protect, getAllUsers);
router.put("/profile", protect, updateProfile);

// User profile routes
router.get("/:handle", getUserProfile);
router.post("/:handle/follow", protect, followUser);
router.get("/:handle/followers", protect, getFollowers);
router.get("/:handle/following", protect, getFollowing);
router.get("/:handle/documents", getUserDocuments);

// Admin routes
router.patch("/:id/verify", protect, admin, verifyUser);
router.post("/:id/roles", protect, admin, addRole);
router.delete("/:id/roles", protect, admin, removeRole);
router.put("/:id/roles", protect, admin, updateUserRoles);

export default router;