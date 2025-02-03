import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ROLES } from '../config/constants.js';

export const admin = async (req, res, next) => {
  if (req.user && req.user.roles.includes(ROLES.ADMIN)) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process***REMOVED***.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};