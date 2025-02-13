import React, { useState, useEffect } from 'react';
import { FiMusic, FiPlus, FiSearch } from 'react-icons/fi';
import axios from '../api';

const Spotify = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queuedTracks, setQueuedTracks] = useState([]);
  const [isLoading, setIsLoading] = useState({
    search: false,
    current: false,
    queue: false
  });

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    try {
      setSearchResults([]); // Clear previous results
      const { data } = await axios.get(`/api/spotify/search?q=${query}`);
      if (data?.tracks?.items) {
        setSearchResults(data.tracks.items);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Maybe add a toast notification here
    }
  };

  const handleAddToQueue = async (trackId) => {
    try {
      await axios.post('/api/spotify/queue', { trackId });
      fetchQueuedTracks();
    } catch (error) {
      console.error('Queue error:', error);
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
      const { data } = await axios.get('/api/spotify/queued');
      setQueuedTracks(data.queue);
    } catch (error) {
      console.error('Queue error:', error);
    }
  };

  useEffect(() => {
    fetchCurrentTrack();
    fetchQueuedTracks();
    const interval = setInterval(() => {
      fetchCurrentTrack();
      fetchQueuedTracks();
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#101113]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <FiMusic className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-white">Community Queue</h1>
              <p className="text-text-secondary">Add songs to the community playlist</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Search Section */}
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
              <div className="relative mb-6">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Search for songs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className="w-full bg-surface-2/50 text-text-primary pl-10 pr-4 py-2 rounded-md 
                           border border-white/5 placeholder:text-text-secondary/50
                           focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-4">
                {searchResults.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-4 bg-surface-2/50 rounded-lg">
                    <img src={track.album.images[2].url} alt={track.name} className="w-12 h-12 rounded" />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{track.name}</div>
                      <div className="text-text-secondary text-sm truncate">
                        {track.artists.map(a => a.name).join(', ')}
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddToQueue(track.id)}
                      className="p-2 text-primary hover:text-primary-hover"
                    >
                      <FiPlus className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Queue Section */}
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Current Queue</h2>
              
              {currentTrack && (
                <div className="mb-8">
                  <div className="text-text-secondary mb-2">Now Playing</div>
                  <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                    <img 
                      src={currentTrack.album.images[2].url} 
                      alt={currentTrack.name} 
                      className="w-12 h-12 rounded" 
                    />
                    <div>
                      <div className="text-white font-medium">{currentTrack.name}</div>
                      <div className="text-text-secondary text-sm">
                        {currentTrack.artists.map(a => a.name).join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {queuedTracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 p-4 bg-surface-2/50 rounded-lg">
                    <img src={track.album.images[2].url} alt={track.name} className="w-12 h-12 rounded" />
                    <div>
                      <div className="text-white font-medium">{track.name}</div>
                      <div className="text-text-secondary text-sm">
                        {track.artists.map(a => a.name).join(', ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spotify;