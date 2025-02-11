import React, { useState, useEffect } from 'react';
import { TbDeviceHeartMonitor } from 'react-icons/tb';
import { FiUsers, FiLink, FiImage, FiFileText } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import axios from '../api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PlatformStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUrls: 0,
    totalImages: 0,
    totalDocuments: 0,
    storage: 0,
    activityGraph: [],
    popularDomains: [],
    userGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get(`/api/stats?range=${timeRange}`);
        console.log('Received stats:', data);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeRange]);

  const formatStorage = (bytes) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#101113] flex items-center justify-center">
        <div className="text-status-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <TbDeviceHeartMonitor className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-white">Platform Statistics</h1>
              <p className="text-text-secondary">Overview of Exalt's performance and usage</p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2 mb-6">
            {['week', 'month', 'year'].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  timeRange === range 
                    ? 'bg-primary text-white' 
                    : 'bg-surface-2 text-text-secondary hover:text-white'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <div className="text-text-secondary">Loading statistics...</div>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-surface-1 rounded-lg p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <FiUsers className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-medium text-text-secondary">Total Users</h3>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalUsers}</div>
                </div>

                <div className="bg-surface-1 rounded-lg p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <FiLink className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-medium text-text-secondary">Total URLs</h3>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalUrls}</div>
                </div>

                <div className="bg-surface-1 rounded-lg p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <FiImage className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-medium text-text-secondary">Total Images</h3>
                  </div>
                  <div className="text-3xl font-bold text-white">{stats.totalImages}</div>
                </div>

                <div className="bg-surface-1 rounded-lg p-6 border border-white/5">
                  <div className="flex items-center gap-3 mb-4">
                    <FiFileText className="w-5 h-5 text-primary" />
                    <h3 className="text-sm font-medium text-text-secondary">Storage Used</h3>
                  </div>
                  <div className="text-3xl font-bold text-white">{formatStorage(stats.storage)}</div>
                </div>
              </div>

              {/* Graphs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface-1 rounded-lg p-6 border border-white/5">
                  <h3 className="text-lg font-medium text-white mb-4">User Growth</h3>
                  {stats.userGrowth?.length > 0 ? (
                    <div className="h-[300px]">
                      <Line
                        data={{
                          labels: stats.userGrowth.map(point => point.date),
                          datasets: [{
                            label: 'New Users',
                            data: stats.userGrowth.map(point => point.count),
                            borderColor: '#6366f1',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.4,
                            fill: true
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: true,
                              labels: {
                                color: 'rgba(255, 255, 255, 0.7)'
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: { color: 'rgba(255, 255, 255, 0.1)' },
                              ticks: { color: 'rgba(255, 255, 255, 0.7)' }
                            },
                            x: {
                              grid: { color: 'rgba(255, 255, 255, 0.1)' },
                              ticks: { 
                                color: 'rgba(255, 255, 255, 0.7)',
                                maxRotation: 45,
                                minRotation: 45
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-text-secondary">
                      No user growth data available
                    </div>
                  )}
                </div>

                <div className="bg-surface-1 rounded-lg p-6 border border-white/5">
                  <h3 className="text-lg font-medium text-white mb-4">Popular Domains</h3>
                  {stats.popularDomains?.length > 0 ? (
                    <div className="space-y-4">
                      {stats.popularDomains.map(domain => (
                        <div key={domain.name} className="flex items-center justify-between">
                          <span className="text-text-secondary">{domain.name}</span>
                          <span className="text-white font-medium">{domain.count} URLs</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-text-secondary">
                      No domain statistics available
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformStats;