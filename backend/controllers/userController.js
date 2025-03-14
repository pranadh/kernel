import User from "../models/User.js";
import Document from "../models/Document.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

export const registerUser = async (req, res) => {
  const { username, handle, password } = req.body;

  try {
    const userExists = await User.findOne({ handle });
    if (userExists) return res.status(400).json({ message: "Handle already exists" });

    const user = await User.create({ username, handle, password });
    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        handle: user.handle,
        roles: user.roles,
        avatar: user.avatar,
        isVerified: user.isVerified,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  const { handle, password } = req.body;
  try {
    const user = await User.findOne({ handle });
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        username: user.username,
        handle: user.handle,
        roles: user.roles,
        isVerified: user.isVerified,
        avatar: user.avatar,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        handle: user.handle,
        roles: user.roles,
        isVerified: user.isVerified,
        followers: user.followers,
        following: user.following,
        createdAt: user.createdAt,
        avatar: user.avatar,
        bannerColor: user.bannerColor,
        bannerImage: user.bannerImage,
        effects: user.effects
      });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('username handle roles isVerified followers following createdAt avatar effects');
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers')
      .populate('following');
      
    res.json({
      _id: user._id,
      username: user.username,
      handle: user.handle,
      roles: user.roles,
      isVerified: user.isVerified,
      followers: user.followers,
      following: user.following,
      avatar: user.avatar,
      bannerImage: user.bannerImage,
      bannerColor: user.bannerColor,
      createdAt: user.createdAt,
      effects: user.effects,
      email: user.email,
      hasEmail: user.hasEmail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const { roles } = req.body;
    user.roles = [...new Set([...user.roles, ...roles])];
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeRole = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    const { roles } = req.body;
    user.roles = user.roles.filter(role => !roles.includes(role));
    if (!user.roles.includes('user')) {
      user.roles.push('user');
    }
    await user.save();
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRoles = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.roles) {
      user.roles = req.body.roles;
      if (!user.roles.includes('user')) {
        user.roles.push('user');
      }
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isVerified = req.body.isVerified;
    await user.save();
    
    res.json({
      _id: user._id,
      username: user.username,
      handle: user.handle,
      roles: user.roles,
      isVerified: user.isVerified
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const followUser = async (req, res) => {
  try {
    // Find user to follow by handle from URL
    const userToFollow = await User.findOne({ handle: req.params.handle });
    // Get current user from auth middleware
    const currentUser = await User.findById(req.user._id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      await currentUser.unfollow(userToFollow._id);
    } else {
      await currentUser.follow(userToFollow._id);
    }

    // Return updated follow status and count
    res.json({ 
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length,
      _id: userToFollow._id // Add this to help frontend state management
    });
  } catch (error) {
    console.error("Follow error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle })
      .populate('followers', 'username handle roles isVerified avatar effects');
      
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle })
      .populate('following', 'username handle roles isVerified avatar effects');
      
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { avatar, bannerColor, bannerImage } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (avatar) user.avatar = avatar;
    if (bannerColor) user.bannerColor = bannerColor;
    if (bannerImage) {
      // Check if GIF and user is verified
      if (bannerImage.startsWith('data:image/gif') && !user.isVerified) {
        return res.status(403).json({ message: "Only verified users can upload GIF banners" });
      }
      user.bannerImage = bannerImage;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      handle: updatedUser.handle,
      avatar: updatedUser.avatar,
      bannerColor: updatedUser.bannerColor,
      bannerImage: updatedUser.bannerImage,
      roles: updatedUser.roles,
      isVerified: updatedUser.isVerified
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserDocuments = async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const documents = await Document.find({ 
      author: user._id,
      isPublic: true 
    })
    .sort({ updatedAt: -1 })
    .select('title content documentId viewCount updatedAt createdAt'); // Ensure both date fields are selected
    
    res.json(documents);
  } catch (error) {
    console.error("Error fetching user documents:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateUserEffects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.effects = {
      ...user.effects,
      ...req.body
    };
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate username
    if (!username || username.length < 1 || username.length > 12) {
      return res.status(400).json({ message: "Username must be between 1 and 12 characters" });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: "Username can only contain letters, numbers and underscores" });
    }

    user.username = username;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate email format
    if (!/^\S+@exlt\.tech$/.test(email)) {
      return res.status(400).json({ message: "Email must be from exlt.tech domain" });
    }

    // Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({ message: "Email is already assigned to another user" });
    }

    user.email = email;
    user.hasEmail = true;
    await user.save();

    res.json({
      message: "Email updated successfully",
      user: {
        _id: user._id,
        email: user.email,
        hasEmail: user.hasEmail
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};