import React, { useState, useEffect } from 'react';
import { FiDatabase, FiServer, FiHardDrive, FiRefreshCw } from 'react-icons/fi';
import axios from '../../api';

const AnalyticsManagement = () => {
  const [stats, setStats] = useState({
    mongodb: {
      totalSpace: 0,
      usedSpace: 0,
      collections: 0,
      documents: 0
    },
    server: {
      totalDiskSpace: 0,
      usedDiskSpace: 0,
      memory: {
        total: 0,
        used: 0
      },
      cpu: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/admin/stats');
      setStats(data);
    } catch (error) {
      setError('Failed to fetch statistics');
      console.error('Stats fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) return <div className="text-center py-8">Loading statistics...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <FiDatabase className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">System Analytics</h2>
        </div>
        <button
          onClick={fetchStats}
          className="p-2 text-text-secondary hover:text-white hover:bg-white/5 rounded-full transition-colors"
        >
          <FiRefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MongoDB Stats */}
        <div className="bg-surface-2/50 rounded-lg border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiDatabase className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-white">MongoDB Statistics</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Storage Used</span>
                <span>{formatBytes(stats.mongodb.usedSpace)} / {formatBytes(stats.mongodb.totalSpace)}</span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.mongodb.usedSpace / stats.mongodb.totalSpace) * 100}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-2/50 p-4 rounded-lg">
                <div className="text-sm text-text-secondary">Collections</div>
                <div className="text-xl font-semibold text-white mt-1">{stats.mongodb.collections}</div>
              </div>
              <div className="bg-surface-2/50 p-4 rounded-lg">
                <div className="text-sm text-text-secondary">Documents</div>
                <div className="text-xl font-semibold text-white mt-1">{stats.mongodb.documents}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Server Stats */}
        <div className="bg-surface-2/50 rounded-lg border border-white/5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FiServer className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium text-white">Server Statistics</h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Disk Space</span>
                <span>{formatBytes(stats.server.usedDiskSpace)} / {formatBytes(stats.server.totalDiskSpace)}</span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.server.usedDiskSpace / stats.server.totalDiskSpace) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-text-secondary mb-1">
                <span>Memory Usage</span>
                <span>{formatBytes(stats.server.memory.used)} / {formatBytes(stats.server.memory.total)}</span>
              </div>
              <div className="w-full bg-surface-2 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stats.server.memory.used / stats.server.memory.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-surface-2/50 p-4 rounded-lg">
              <div className="text-sm text-text-secondary">CPU Usage</div>
              <div className="text-xl font-semibold text-white mt-1">{stats.server.cpu}%</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalyticsManagement;