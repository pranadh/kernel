import React, { useState, useEffect } from 'react';
import { FiMusic, FiPlus, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from '../api';

const Spotify = () => {
  const { user } = useAuth();
  const [authUrl, setAuthUrl] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queuedTracks, setQueuedTracks] = useState([]);
  const [trackUrl, setTrackUrl] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState({
    submit: false,
    current: false,
    queue: false
  });

  const handleSpotifyAuth = async () => {
    try {
      setError(null);
      const { data } = await axios.get('/api/spotify/auth');
      // Redirect to Spotify auth URL
      window.location.href = data.url;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to authenticate with Spotify');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackUrl.trim()) return;

    try {
      setIsLoading(prev => ({ ...prev, submit: true }));
      setError(null);
      await axios.post('/api/spotify/queue', { trackUrl });
      setTrackUrl('');
      fetchQueuedTracks();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add track to queue');
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const fetchCurrentTrack = async () => {
    try {
      setIsLoading(prev => ({ ...prev, current: true }));
      const { data } = await axios.get('/api/spotify/current');
      if (data?.item) {
        setCurrentTrack(data.item);
      }
    } catch (error) {
      console.error('Current track error:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, current: false }));
    }
  };

  const fetchQueuedTracks = async () => {
    try {
      setIsLoading(prev => ({ ...prev, queue: true }));
      const { data } = await axios.get('/api/spotify/queued');
      setQueuedTracks(data.queue || []);
    } catch (error) {
      console.error('Queue error:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, queue: false }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCurrentTrack(), fetchQueuedTracks()]);
    };
    
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {user?.roles?.includes('admin') && (
            <div className="mb-6 p-4 bg-surface-2/50 backdrop-blur-sm rounded-lg border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">Admin Controls</span>
                <button
                  onClick={handleSpotifyAuth}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-md text-white 
                           transition-colors text-sm"
                >
                  Connect Spotify Account
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mb-8">
            <FiMusic className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-white">Community Queue</h1>
              <p className="text-text-secondary">Add songs to the community playlist</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-lg 
                          flex items-center gap-3 text-status-error">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8">
            {/* Add Track Section */}
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="trackUrl" className="block text-sm font-medium text-text-secondary mb-2">
                    Spotify Track URL
                  </label>
                  <input
                    type="text"
                    id="trackUrl"
                    placeholder="https://open.spotify.com/track/..."
                    value={trackUrl}
                    onChange={(e) => setTrackUrl(e.target.value)}
                    className="w-full bg-surface-2/50 text-text-primary px-4 py-2 rounded-md 
                             border border-white/5 placeholder:text-text-secondary/50
                             focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading.submit || !trackUrl.trim()}
                  className="w-full px-4 py-2 bg-primary hover:bg-primary-hover disabled:opacity-50 
                           disabled:cursor-not-allowed rounded-md text-white transition-colors flex 
                           items-center justify-center gap-2"
                >
                  {isLoading.submit ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    'Add to Queue'
                  )}
                </button>
              </form>
            </div>

            {/* Now Playing Section */}
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Now Playing</h2>
              {isLoading.current ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : currentTrack ? (
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                  <img 
                    src={currentTrack.album.images[1].url} 
                    alt={currentTrack.name}
                    className="w-16 h-16 rounded" 
                  />
                  <div>
                    <div className="text-white font-medium">{currentTrack.name}</div>
                    <div className="text-text-secondary">
                      {currentTrack.artists.map(a => a.name).join(', ')}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  No track currently playing
                </div>
              )}
            </div>

            {/* Queue Section */}
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Coming Up Next</h2>
              {isLoading.queue ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : queuedTracks.length > 0 ? (
                <div className="space-y-4">
                  {queuedTracks.map((track) => (
                    <div key={track.id} className="flex items-center gap-4 p-4 bg-surface-2/50 rounded-lg">
                      <img 
                        src={track.album.images[2].url} 
                        alt={track.name} 
                        className="w-12 h-12 rounded" 
                      />
                      <div>
                        <div className="text-white font-medium">{track.name}</div>
                        <div className="text-text-secondary text-sm">
                          {track.artists.map(a => a.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  Queue is empty
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spotify;