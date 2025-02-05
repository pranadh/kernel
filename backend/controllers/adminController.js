import os from 'os';
import { exec } from 'child_process';
import util from 'util';
const execAsync = util.promisify(exec);

export const getSystemStats = async (req, res) => {
  try {
    // Get MongoDB connection from app locals
    const db = req.app.locals.db;
    if (!db) {
      throw new Error('Database connection not available');
    }

    // Get MongoDB stats
    const dbStats = await db.db.stats();
    const collections = await db.db.listCollections().toArray();

    // Get system stats using commands instead of diskusage
    const { stdout: dfOutput } = await execAsync('df -B1 /');
    const [, used, available] = dfOutput.split('\n')[1].split(/\s+/);

    // Get memory info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // Get CPU load
    const cpuLoad = os.loadavg()[0];

    res.json({
      mongodb: {
        totalSpace: dbStats.storageSize || 0,
        usedSpace: dbStats.dataSize || 0,
        collections: collections.length,
        documents: dbStats.objects || 0
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