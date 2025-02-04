import Document from '../models/Document.js';

export const createDocument = async (req, res) => {
  try {
    const document = await Document.create({
      ...req.body,
      author: req.user._id
    });
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserDocuments = async (req, res) => {
  try {
    const documents = await Document.find({ author: req.user._id })
      .sort({ updatedAt: -1 });
    res.json(documents);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id })
      .populate('author', 'username handle avatar isVerified') // Add isVerified to populated fields
      .select('title content documentId viewCount updatedAt createdAt author');
    
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
  
export const updateDocument = async (req, res) => {
  try {
    const document = await Document.findOne({ documentId: req.params.id });
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Allow admins to edit any document, otherwise check if user is author
    if (!req.user.roles.includes('admin') && document.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(document, req.body);
    await document.save();
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

  export const deleteDocument = async (req, res) => {
    try {
      const document = await Document.findOne({ documentId: req.params.id });
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
  
      // Allow admins to delete any document, otherwise check if user is author
      if (!req.user.roles.includes('admin') && document.author.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }
  
      await Document.deleteOne({ _id: document._id });
      res.json({ message: 'Document deleted' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  export const incrementViewCount = async (req, res) => {
    try {
      const document = await Document.findOneAndUpdate(
        { documentId: req.params.id },
        { $inc: { viewCount: 1 } },
        { new: true, timestamps: false }
      ).populate('author', 'username handle avatar isVerified');
      
      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }
      
      res.json(document);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  export const getGlobalDocuments = async (req, res) => {
    try {
      const documents = await Document.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('author', 'username handle avatar isVerified')
        .select('title content documentId viewCount updatedAt createdAt');
      
      res.json(documents);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  export const searchDocuments = async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.json([]);
      }
  
      const documents = await Document.find({
        isPublic: true,
        title: { $regex: query, $options: 'i' }
      })
      .limit(10)
      .sort({ updatedAt: -1 })
      .populate('author', 'username handle avatar isVerified')
      .select('title documentId author viewCount updatedAt createdAt');
  
      res.json(documents);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

  export const getAllDocuments = async (req, res) => {
    try {
      const documents = await Document.find({})
        .sort({ createdAt: -1 })
        .populate('author', 'username handle avatar isVerified')
        .select('title documentId viewCount updatedAt createdAt author');
      
      res.json(documents);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };