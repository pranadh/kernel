import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import TypingScore from '../models/TypingScore.js';

const router = express.Router();

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { duration } = req.query;
    const scores = await TypingScore.find({ 
      duration: Number(duration)
    })
      .sort({ wpm: -1 })
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

router.get('/user-stats', protect, async (req, res) => {
  try {
    const { duration } = req.query;
    const userScores = await TypingScore.find({ 
      user: req.user._id,
      duration: Number(duration)
    });

    const stats = {
      bestRun: userScores.reduce((max, score) => score.wpm > max.wpm ? score : max, { wpm: 0, accuracy: 0 }),
      avgWpm: Math.round(userScores.reduce((sum, score) => sum + score.wpm, 0) / userScores.length) || 0,
      avgAccuracy: Math.round(userScores.reduce((sum, score) => sum + score.accuracy, 0) / userScores.length) || 0,
      testCount: userScores.length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;