import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import TypingScore from '../models/TypingScore.js';

const router = express.Router();

// Get leaderboard
router.get('/', async (req, res) => {
  try {
    const scores = await TypingScore.find()
      .sort({ wpm: -1 })
      .limit(10)
      .populate('user', 'username handle avatar isVerified effects');
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save new score
router.post('/', protect, async (req, res) => {
  try {
    const score = await TypingScore.create({
      user: req.user._id,
      ...req.body
    });
    res.status(201).json(score);
  } catch (error) {
    res.status(400).json({ message: 'Invalid data' });
  }
});

export default router;