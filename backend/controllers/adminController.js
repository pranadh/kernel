import os from 'os';
import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);

export const getSystemStats = async (req, res) => {
    try {
      const db = req.app.locals.db;
      if (!db) {
        throw new Error('Database connection not available');
      }
  
      // Get stats for each collection
      const collections = await db.db.listCollections().toArray();
      let totalDataSize = 0;
      let collectionStats = [];
  
      for (const collection of collections) {
        const stats = await db.db.collection(collection.name).stats();
        totalDataSize += stats.size;
        collectionStats.push({
          name: collection.name,
          size: stats.size
        });
      }
  
      res.json({
        mongodb: {
          totalSpace: 512 * 1024 * 1024, // 512MB Atlas free tier limit
          usedSpace: totalDataSize,
          collections: collections.length,
          documents: (await db.db.stats()).objects,
          collectionSizes: collectionStats // Additional detail
        },
      server: {
        totalDiskSpace: parseInt(used) + parseInt(available),
        usedDiskSpace: parseInt(used),
        memory: {
          total: totalMem,
          used: usedMem
        },
        cpu: Math.round(cpuLoad * 100 / os.cpus().length) // Convert load to percentage
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch system statistics',
      error: error.message 
    });
  }
};