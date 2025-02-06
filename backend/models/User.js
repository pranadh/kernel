import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES, BCRYPT_SALT_ROUNDS } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 12,
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
  },
  handle: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 1,
    maxlength: 12,
    match: [/^[a-zA-Z0-9_]+$/, 'Handle can only contain letters, numbers and underscores']
  },
  password: { 
    type: String, 
    required: true,
    minlength: 1
  },
  roles: [{
    type: String,
    enum: Object.values(ROLES),
    default: [ROLES.USER]
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: String,
    default: () => {
      const now = new Date();
      return now.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    }
  },
  avatar: {
    type: String,
    default: null
  },
  bannerImage: {
    type: String,
    default: null
  },
  bannerColor: {
    type: String,
    default: '#6366f1', // Default to primary color
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Invalid hex color code'
    }
  },
}, {
  timestamps: false, // Disable automatic timestamps
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
  }
  return this.save();
};

userSchema.methods.removeRole = function(role) {
  if (role === ROLES.USER) return;
  this.roles = this.roles.filter(r => r !== role);
  return this.save();
};

userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

userSchema.methods.follow = async function(userId) {
  if (!this.following.includes(userId)) {
    this.following.push(userId);
    await User.findByIdAndUpdate(userId, { $push: { followers: this._id } });
    await this.save();
  }
};

userSchema.methods.unfollow = async function(userId) {
  if (this.following.includes(userId)) {
    this.following = this.following.filter(id => id.toString() !== userId.toString());
    await User.findByIdAndUpdate(userId, { $pull: { followers: this._id } });
    await this.save();
  }
};

const User = mongoose.model("User", userSchema);
export { User as default, ROLES };