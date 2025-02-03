import User from "../models/User.js";
import { ROLES } from "../config/constants.js";

export const getRoles = async (req, res) => {
  try {
    // Filter out 'user' role as it's default
    const roles = Object.values(ROLES).filter(role => role !== ROLES.USER);
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignRole = async (req, res) => {
  try {
    const { userId, roles } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure USER role is always present
    const newRoles = [...new Set([...roles, ROLES.USER])];
    user.roles = newRoles;
    await user.save();

    res.json({ 
      message: "Roles updated successfully",
      roles: user.roles 
    });
  } catch (error) {
    console.error('Role assignment error:', error);
    res.status(500).json({ message: error.message });
  }
};