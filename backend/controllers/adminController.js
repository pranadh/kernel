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

        // Get stats for each collection using command() instead of stats()
        const collections = await db.db.listCollections().toArray();
        let totalDataSize = 0;
        let collectionStats = [];

        for (const collection of collections) {
            const stats = await db.db.command({ 
                collStats: collection.name,
                scale: 1 
            });
            totalDataSize += stats.size;
            collectionStats.push({
                name: collection.name,
                size: stats.size
            });
        }

        // Get disk usage using df command
        const { stdout: dfOutput } = await execAsync('df -B1 /');
        const [, used, available] = dfOutput.split('\n')[1].split(/\s+/);

        // Get system memory info
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        // Get CPU load average (1 minute)
        const cpuLoad = os.loadavg()[0];

        // Get MongoDB database stats using command()
        const dbStats = await db.db.command({ dbStats: 1, scale: 1 });

        res.json({
            mongodb: {
                totalSpace: 512 * 1024 * 1024, // 512MB Atlas free tier limit
                usedSpace: totalDataSize,
                collections: collections.length,
                documents: dbStats.objects,
                collectionSizes: collectionStats
            },
            server: {
                totalDiskSpace: parseInt(used) + parseInt(available),
                usedDiskSpace: parseInt(used),
                memory: {
                    total: totalMem,
                    used: usedMem
                },
                cpu: Math.round(cpuLoad * 100 / os.cpus().length)
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