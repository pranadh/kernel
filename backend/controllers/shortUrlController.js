import ShortUrl from '../models/ShortUrl.js';

export const createShortUrl = async (req, res) => {
  try {
    const { url, customAlias, expiresIn } = req.body;
    
    if (!isValidUrl(url)) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    // Handle expiration (expiresIn is now in minutes)
    const expiresAt = expiresIn === null ? 
      null : // No expiration for verified users
      new Date(+new Date() + expiresIn * 60 * 1000); // Convert minutes to milliseconds

    if (customAlias) {
      if (!req.user.isVerified) {
        return res.status(403).json({ message: "Only verified users can create custom aliases" });
      }

      const existingAlias = await ShortUrl.findOne({ customAlias });
      if (existingAlias) {
        return res.status(400).json({ message: "Custom alias already taken" });
      }
    }

    const shortUrl = await ShortUrl.create({
      originalUrl: url,
      customAlias,
      author: req.user._id,
      expiresAt
    });

    res.status(201).json(shortUrl);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getGlobalUrls = async (req, res) => {
  try {
    const urls = await ShortUrl.find({ 
      isPublic: true,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('author', 'username handle avatar isVerified');
    
    res.json(urls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserUrls = async (req, res) => {
  try {
    const urls = await ShortUrl.find({ 
      author: req.user._id,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: null }
      ]
    })
      .sort({ createdAt: -1 })
      .populate('author', 'username handle avatar isVerified');
    res.json(urls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const redirectToUrl = async (req, res) => {
  try {
    const { shortId } = req.params;
    
    const shortUrl = await ShortUrl.findOneAndUpdate(
      { 
        $or: [{ shortId }, { customAlias: shortId }],
        $or: [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: null }
        ]
      },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!shortUrl) {
      return res.status(404).json({ message: "URL not found or has expired" });
    }

    res.redirect(shortUrl.originalUrl);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteUrl = async (req, res) => {
  try {
    const url = await ShortUrl.findById(req.params.id);
    
    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    if (url.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await url.deleteOne();
    res.json({ message: "URL deleted" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default {
  createShortUrl,
  getGlobalUrls,
  getUserUrls,
  redirectToUrl,
  deleteUrl
};