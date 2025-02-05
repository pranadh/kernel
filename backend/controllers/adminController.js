import { MongoClient } from 'mongodb';
import os from 'os';
import diskusage from 'diskusage';

export const getSystemStats = async (req, res) => {
  try {
    // MongoDB Stats
    const db = req.app.get('db');
    const dbStats = await db.stats();
    const collections = await db.listCollections().toArray();
    
    // Server Stats
    const path = '/';
    const disk = diskusage.checkSync(path);
    const memory = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem()
    };
    const cpus = os.cpus();
    const cpuUsage = cpus.reduce((acc, cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b);
      const idle = cpu.times.idle;
      return acc + ((total - idle) / total) * 100;
    }, 0) / cpus.length;

    res.json({
      mongodb: {
        totalSpace: dbStats.storageSize,
        usedSpace: dbStats.dataSize,
        collections: collections.length,
        documents: dbStats.objects
      },
      server: {
        totalDiskSpace: disk.total,
        usedDiskSpace: disk.total - disk.free,
        memory: {
          total: memory.total,
          used: memory.used
        },
        cpu: Math.round(cpuUsage)
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch system statistics' });
  }
};