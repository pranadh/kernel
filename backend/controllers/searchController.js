import User from '../models/User.js';
import Document from '../models/Document.js';
import ShortUrl from '../models/ShortUrl.js';
import Image from '../models/Image.js';

export const searchAll = async (req, res) => {
  try {
    const { q: query } = req.query;
    if (!query) return res.json({ users: [], documents: [], urls: [], images: [] });

    const [users, documents, urls, images] = await Promise.all([
      // Search users
      User.find({
        $or: [
          { username: { $regex: query, $options: 'i' } },
          { handle: { $regex: query, $options: 'i' } }
        ]
      })
      .select('username handle avatar isVerified')
      .limit(25),

      // Search documents
      Document.find({
        isPublic: true,
        title: { $regex: query, $options: 'i' }
      })
      .populate('author', 'username handle avatar isVerified')
      .select('title documentId viewCount author')
      .limit(25),

      // Search URLs
      ShortUrl.find({
        $or: [
          { shortId: { $regex: query, $options: 'i' } },
          { originalUrl: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('author', 'username handle avatar isVerified')
      .select('shortId originalUrl clicks author')
      .limit(25),

      // Search images
      Image.find({
        imageId: { $regex: query, $options: 'i' }
      })
      .populate('author', 'username handle avatar isVerified')
      .select('imageId author size')
      .limit(25)
    ]);

    res.json({ users, documents, urls, images });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};