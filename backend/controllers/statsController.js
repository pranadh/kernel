import User from '../models/User.js';
import Url from '../models/ShortUrl.js';
import Image from '../models/Image.js';
import Document from '../models/Document.js';

export const getPlatformStats = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date range
    const now = new Date();
    const rangeDate = new Date();
    switch (range) {
      case 'week':
        rangeDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        rangeDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        rangeDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Convert to YYYY-MM-DD format to match the stored format
    const rangeDateString = rangeDate.toISOString().split('T')[0];

    // Get basic stats
    const [totalUsers, totalUrls, totalImages, totalDocuments] = await Promise.all([
      User.countDocuments(),
      Url.countDocuments(),
      Image.countDocuments(),
      Document.countDocuments()
    ]);

    // Calculate storage used
    const images = await Image.find({}, 'size');
    const storage = images.reduce((acc, img) => acc + (img.size || 0), 0);

    // Get user growth data with string date comparison
    const userGrowth = await User.aggregate([
      { 
        $match: { 
          createdAt: { $gte: rangeDateString }
        } 
      },
      { 
        $group: {
          _id: "$createdAt",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get popular domains
    const popularDomains = await Url.aggregate([
      { $project: { domain: { $arrayElemAt: [{ $split: ["$originalUrl", "/"] }, 2] } } },
      { $group: { _id: "$domain", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalUsers,
      totalUrls,
      totalImages,
      totalDocuments,
      storage,
      userGrowth: userGrowth.map(point => ({
        date: point._id,
        count: point.count
      })),
      popularDomains: popularDomains.map(domain => ({
        name: domain._id || 'Unknown',
        count: domain.count
      }))
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};