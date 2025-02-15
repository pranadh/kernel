import React, { useState, useEffect, useCallback, memo } from 'react';
import { 
  FiLoader, FiAlertCircle, FiCheck, FiClock, FiSearch,
  FiVolume2, FiPlayCircle, FiPauseCircle, FiSpeaker, FiX,
  FiSkipBack, FiSkipForward, FiInfo, FiUsers, FiExternalLink 
} from 'react-icons/fi';
import { PiVinylRecord, PiQueue, PiClockCounterClockwise } from "react-icons/pi";
import { SlSocialSpotify } from 'react-icons/sl';
import { AiOutlineSound } from 'react-icons/ai';
import { useAuth } from '../context/AuthContext';
import { VscVerifiedFilled } from "react-icons/vsc";
import axios from '../api';

const Spotify = () => {
  const { user } = useAuth();
  const [controlsDisabled, setControlsDisabled] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [queuedTracks, setQueuedTracks] = useState([]);
  const [clientProgress, setClientProgress] = useState(0);
  const [success, setSuccess] = useState(null);
  const [refreshTimer, setRefreshTimer] = useState(20);
  const [requestedSongs, setRequestedSongs] = useState(new Map());
  const [trackUrl, setTrackUrl] = useState('');
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isLoading, setIsLoading] = useState({
    submit: false,
    current: false,
    queue: false,
    playback: false,
    volume: false,
    recent: false
  });
  const [playbackState, setPlaybackState] = useState({
    device: null,
    progress_ms: 0,
    volume_percent: 0,
    is_playing: false
  });

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const fetchCurrentTrack = async () => {
    try {
      setIsLoading(prev => ({ ...prev, current: true }));
      
      // Add delay before fetching to ensure queue is updated
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const [{ data: currentData }, { data: queueData }, { data: recentData }] = await Promise.all([
        axios.get('/api/spotify/current'),
        axios.get('/api/spotify/queued'),
        axios.get('/api/spotify/recent')
      ]);
    
      if (currentData?.item) {
        setCurrentTrack(currentData.item);
        setPlaybackState({
          device: currentData.device,
          progress_ms: currentData.progress_ms,
          volume_percent: currentData.volume_percent,
          is_playing: currentData.is_playing
        });
    
        // Create new Map combining queue and recent data
        const newRequestedSongs = new Map();
        
        // Add current track's requester if exists - This is key
        if (currentData.requestedBy) {
          newRequestedSongs.set(currentData.item.id, {
            user: currentData.requestedBy,
            track: currentData.item
          });
        }
        
        // Add queue data as fallback
        queueData?.queue?.forEach(track => {
          if (track.requestedBy && !newRequestedSongs.has(track.id)) {
            newRequestedSongs.set(track.id, {
              user: track.requestedBy,
              track: track
            });
          }
        });
  
        // Add recently played data as final fallback
        recentData?.tracks?.forEach(track => {
          if (track.requestedBy && !newRequestedSongs.has(track.id)) {
            newRequestedSongs.set(track.id, {
              user: track.requestedBy,
              track: track
            });
          }
        });
  
        setRequestedSongs(newRequestedSongs);
      } else {
        setCurrentTrack(null);
        setPlaybackState({
          device: null,
          progress_ms: 0,
          volume_percent: 0,
          is_playing: false
        });
      }
    } catch (error) {
      console.error('Current track error:', error);
      setCurrentTrack(null);
    } finally {
      setIsLoading(prev => ({ ...prev, current: false }));
    }
  };

  const fetchQueuedTracks = useCallback(async () => {
    try {
      setIsLoading(prev => ({ ...prev, queue: true, recent: true }));
      const [queueData, recentData] = await Promise.all([
        axios.get('/api/spotify/queued'),
        axios.get('/api/spotify/recent')
      ]);
      
      setQueuedTracks(queueData.data?.queue || []);
      setRecentlyPlayed(recentData.data.tracks);
      
      // Update requestedSongs Map with server data
      const newRequestedSongs = new Map();
      queueData.data.queue?.forEach(track => {
        if (track.requestedBy) {
          newRequestedSongs.set(track.id, {
            user: {
              username: track.requestedBy.username,
              avatar: track.requestedBy.avatar,
              isVerified: track.requestedBy.isVerified
            },
            track: track
          });
        }
      });
      setRequestedSongs(newRequestedSongs);
      
      // Reset timer to 20 seconds after each fetch
      setRefreshTimer(20);
    } catch (error) {
      console.error('Queue error:', error);
      if (error.response?.status === 401) {
        setError('Spotify authentication required. Please try again.');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch queue');
      }
      setQueuedTracks([]);
    } finally {
      setIsLoading(prev => ({ ...prev, queue: false, recent: false }));
    }
  }, []);

  const fetchRecentlyPlayed = async () => {
    try {
      setIsLoading(prev => ({ ...prev, recent: true }));
      const { data } = await axios.get('/api/spotify/recent');
      setRecentlyPlayed(data.tracks);
    } catch (error) {
      console.error('Recently played error:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, recent: false }));
    }
  };

  const getMediaDetails = (item) => {
    if (!item?.id || !item?.name) return null;
  
    // Handle podcast episodes
    if (item.type === 'episode') {
      return {
        id: item.id,
        name: item.name,
        artists: [{ name: item.show?.name || 'Podcast' }],
        album: {
          images: item.images || []
        },
        duration_ms: item.duration_ms,
        type: 'episode'
      };
    }
  
    // Handle regular tracks
    if (item.type === 'track') {
      if (!item.album?.images?.length || !item.artists) return null;
      return {
        id: item.id,
        name: item.name,
        artists: item.artists,
        album: item.album,
        duration_ms: item.duration_ms,
        type: 'track'
      };
    }
  
    return null;
  };

  const UserWithVerified = ({ user }) => (
    <div className="flex items-center gap-1">
      <span>{user.username}</span>
      {user.isVerified && (
        <VscVerifiedFilled className="w-4 h-4 text-primary flex-shrink-0" />
      )}
    </div>
  );

  const SpotifyProfile = memo(({ profile }) => {
    return (
      <div className="mt-6 p-4 bg-surface-2/50 backdrop-blur-sm rounded-lg flex items-center gap-4 border border-primary/50">
        {profile.image ? (
          <img 
            src={profile.image} 
            alt={profile.name}
            className="w-12 h-12 rounded-md object-cover" 
          />
        ) : (
          <div className="w-12 h-12 rounded-md bg-surface-2 flex items-center justify-center">
            <SlSocialSpotify className="w-6 h-6 text-text-secondary" />
          </div>
        )}
        <div className="flex-1">
          <div className="text-white font-medium flex items-center gap-2">
            {profile.name}
            <div className="px-2 py-0.5 bg-primary/10 rounded text-xs text-primary">
              Host
            </div>
          </div>
          <div className="text-text-secondary text-sm flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FiUsers className="w-4 h-4" />
              <span>{profile.followers.toLocaleString()} followers</span>
            </div>
            <span>•</span>
            <a 
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              <FiExternalLink className="w-4 h-4" />
              <span>View Profile</span>
            </a>
          </div>
        </div>
      </div>
    );
  });

  const handleVolumeChange = async (newVolume) => {
    try {
      setIsLoading(prev => ({ ...prev, volume: true }));
      await axios.put('/api/spotify/volume', { volume: newVolume });
      setPlaybackState(prev => ({ ...prev, volume_percent: newVolume }));
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to adjust volume');
    } finally {
      setIsLoading(prev => ({ ...prev, volume: false }));
    }
  };
  
  const handlePlaybackControl = async (action) => {
    try {
      setIsLoading(prev => ({ ...prev, playback: true }));
      setControlsDisabled(true);
      
      await axios.post('/api/spotify/playback', { action });
      
      if (action === 'play' || action === 'pause') {
        setPlaybackState(prev => ({ ...prev, is_playing: action === 'play' }));
        setTimeout(() => setControlsDisabled(false), 500);
        return;
      }
      
      if (action === 'next' || action === 'previous') {
        try {
          // Wait for Spotify to update
          await new Promise(resolve => setTimeout(resolve, 2000)); // Increase delay
          
          // Fetch all updated data
          await Promise.all([
            fetchCurrentTrack(),
            fetchQueuedTracks(),
            fetchRecentlyPlayed()
          ]);
          
          setControlsDisabled(false);
        } catch (error) {
          console.error('Track change update error:', error);
          setControlsDisabled(false);
        }
      }
    } catch (error) {
      console.error('Playback control error:', error);
      setError(error.response?.data?.message || 'Failed to control playback');
      setControlsDisabled(false);
    } finally {
      setIsLoading(prev => ({ ...prev, playback: false }));
    }
  };

  const handleSpotifyAuth = async () => {
    try {
      setError(null);
      const { data } = await axios.get('/api/spotify/auth');
      window.location.href = data.url;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to authenticate with Spotify');
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setShowSearchResults(false);
      return;
    }
  
    try {
      setIsSearching(true);
      setError(null);
      const { data } = await axios.get(`/api/spotify/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(data.tracks || []);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setError('Failed to search tracks');
    } finally {
      setIsSearching(false);
    }
  };
  
  // Add this new function to handle closing search results
  const handleCloseSearch = () => {
    setShowSearchResults(false);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!trackUrl.trim()) return;
  
    try {
      setIsLoading(prev => ({ ...prev, submit: true }));
      setError(null);
      const { data } = await axios.post('/api/spotify/queue', { trackUrl });
      
      if (data.track && data.track.id) {
        setTrackUrl('');
        
        // First fetch updated queue
        await fetchQueuedTracks();
        
        // Then show success message
        setSuccess('Track added to queue successfully!');
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add track to queue');
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(prev => ({ 
          ...prev, 
          current: true,
          queue: true,
          recent: true
        }));
  
        const [currentResponse, queueResponse, recentResponse, profileResponse] = await Promise.all([
          axios.get('/api/spotify/current'),
          axios.get('/api/spotify/queued'),
          axios.get('/api/spotify/recent'),
          axios.get('/api/spotify/profile')
        ]);
  
        // Create new Map combining all requester data
        const newRequestedSongs = new Map();
        
        // Add queue data first since it's most current
        queueResponse.data?.queue?.forEach(track => {
          if (track.requestedBy) {
            newRequestedSongs.set(track.id, {
              user: {
                username: track.requestedBy.username,
                avatar: track.requestedBy.avatar,
                isVerified: track.requestedBy.isVerified
              },
              track: track
            });
          }
        });
  
        // Add recently played data only if not already in map
        recentResponse.data?.tracks?.forEach(track => {
          if (track.requestedBy && !newRequestedSongs.has(track.id)) {
            newRequestedSongs.set(track.id, {
              user: {
                username: track.requestedBy.username,
                avatar: track.requestedBy.avatar,
                isVerified: track.requestedBy.isVerified
              },
              track: track
            });
          }
        });
  
        // Set all states after collecting data
        setRequestedSongs(newRequestedSongs);
        
        if (currentResponse.data?.item) {
          setCurrentTrack(currentResponse.data.item);
          setPlaybackState({
            device: currentResponse.data.device,
            progress_ms: currentResponse.data.progress_ms,
            volume_percent: currentResponse.data.volume_percent,
            is_playing: currentResponse.data.is_playing
          });
        }
  
        setQueuedTracks(queueResponse.data?.queue || []);
        setRecentlyPlayed(recentResponse.data?.tracks || []);
        setSpotifyProfile(profileResponse.data.profile);
        setRefreshTimer(20);
  
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.response?.data?.message || 'Failed to fetch data');
      } finally {
        setIsLoading(prev => ({ 
          ...prev, 
          current: false,
          queue: false,
          recent: false
        }));
      }
    };
  
    fetchData();
    const interval = setInterval(fetchData, 20000);
    return () => clearInterval(interval);
  }, []);

  // Timer tracker
  useEffect(() => {
    let countdown;
  
    // Only start countdown if timer is greater than 0
    if (refreshTimer > 0) {
      countdown = setInterval(() => {
        setRefreshTimer(prev => {
          const newValue = prev - 1;
          return newValue >= 0 ? newValue : 0;
        });
      }, 1000);
    }
  
    // Cleanup function
    return () => {
      if (countdown) {
        clearInterval(countdown);
      }
    };
  }, [refreshTimer]);

  // Keep track of song progress
  useEffect(() => {
    let progressTimer;
    
    if (currentTrack && playbackState.is_playing) {
      // Initialize client progress with server value 
      setClientProgress(playbackState.progress_ms);
      
      progressTimer = setInterval(() => {
        setClientProgress(prev => {
          // When song completes, trigger immediate refresh
          if (prev >= currentTrack.duration_ms) {
            clearInterval(progressTimer);
            // Fetch new track data immediately
            Promise.all([fetchCurrentTrack(), fetchQueuedTracks()]);
            return currentTrack.duration_ms;
          }
          return prev + 1000;
        });
      }, 1000);
    }
  
    return () => {
      if (progressTimer) {
        clearInterval(progressTimer); 
      }
    };
  }, [currentTrack, playbackState.progress_ms, playbackState.is_playing]);

  const NowPlaying = ({ currentTrack, playbackState, clientProgress, user, handlers, requestedBy }) => {
    const isDJ = user?.roles?.includes('dj');
    
    return (
      <div className="flex gap-8">
        {/* Left side - Album Art */}
        <div className="flex-shrink-0 w-[28rem]">
          <img 
            src={currentTrack.album.images[0].url} 
            alt={currentTrack.name}
            className="w-full h-[28rem] rounded-lg shadow-lg object-cover" 
          />
        </div>
  
        {/* Right side - Track Info and Controls */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Track Info */}
          <div>
            <div className="text-2xl font-bold text-white truncate">
              {currentTrack.name}
            </div>
            <div className="text-text-secondary text-lg">
              {currentTrack.artists.map(a => a.name).join(', ')}
            </div>
          </div>
  
          {/* Device Info and Requester */}
          <div className="flex flex-col gap-6 mt-4">
            <div className="flex items-center gap-2">
              <FiSpeaker className="w-6 h-6 text-white" />
              <span className="text-sm text-white">
                {playbackState.device?.name === "EXLT" ? "Room Speaker" : playbackState.device?.name || 'No device'}
              </span>
            </div>

            {/* Updated requester info to match search results style */}
            <div className="inline-flex items-center gap-2 p-3 bg-surface-2/50 rounded-md">
              {requestedBy ? (
                <div className="flex items-center gap-1">
                  <div className="text-sm text-text-secondary">Queued by</div>
                  <div className="text-sm text-white font-medium flex items-center gap-1">
                    <UserWithVerified user={requestedBy} />
                  </div>
                  {requestedBy.avatar ? (
                    <img 
                      src={requestedBy.avatar}
                      alt={requestedBy.username}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary">
                      {requestedBy.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-text-secondary text-sm">
                  <span>Automatic from Spotify</span>
                  <SlSocialSpotify className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
  
          {/* Controls and Progress Section - Pushed to bottom */}
          <div className="mt-auto space-y-6">
            {/* Warning for non-DJs */}
            {!isDJ && (
              <div className="flex items-center gap-2 text-sm text-status-error/75">
                <FiInfo className="w-4 h-4" />
                <span>Playback controls require DJ privileges</span>
              </div>
            )}
  
            {/* Volume and Playback Controls */}
            <div className="flex items-center justify-between">
              {/* Volume Control */}
              <div className="flex items-center gap-2">
                <FiVolume2 className="w-6 h-6 text-text-secondary" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playbackState.volume_percent}
                  onChange={(e) => handlers.handleVolumeChange(parseInt(e.target.value))}
                  className="w-48 h-3 bg-surface-2/50 rounded-full appearance-none 
                           [&::-webkit-slider-thumb]:appearance-none 
                           [&::-webkit-slider-thumb]:h-3 
                           [&::-webkit-slider-thumb]:w-3
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-primary
                           [&::-webkit-slider-thumb]:border-2
                           [&::-webkit-slider-thumb]:border-surface-1
                           hover:cursor-pointer
                           disabled:opacity-50
                           disabled:cursor-not-allowed"
                  disabled={!isDJ || handlers.isLoading.volume}
                />
                <span className="text-sm text-text-secondary min-w-[40px]">
                  {playbackState.volume_percent}%
                </span>
              </div>
  
              {/* Playback Controls */}
              <div className="flex items-center gap-2">
              <button
                onClick={() => handlers.handlePlaybackControl('previous')}
                disabled={!isDJ || handlers.isLoading.playback || handlers.controlsDisabled}
                className="p-2 hover:bg-surface-2/50 rounded-full transition-colors
                        disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSkipBack className="w-6 h-6 text-text-secondary" />
              </button>
  
                <button
                  onClick={() => handlers.handlePlaybackControl(playbackState.is_playing ? 'pause' : 'play')}
                  disabled={!isDJ || handlers.isLoading.playback || handlers.controlsDisabled}
                  className="p-2 hover:bg-surface-2/50 rounded-full transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {handlers.isLoading.playback ? (
                    <FiLoader className="w-7 h-7 text-primary animate-spin" />
                  ) : playbackState.is_playing ? (
                    <FiPauseCircle className="w-7 h-7 text-text-secondary" />
                  ) : (
                    <FiPlayCircle className="w-7 h-7 text-text-secondary" />
                  )}
                </button>
  
                <button
                  onClick={() => handlers.handlePlaybackControl('next')}
                  disabled={!isDJ || handlers.isLoading.playback || handlers.controlsDisabled}
                  className="p-2 hover:bg-surface-2/50 rounded-full transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSkipForward className="w-6 h-6 text-text-secondary" />
                </button>
              </div>
            </div>
  
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-surface-2/50 rounded-full h-1.5 relative">
                <div 
                  className="bg-primary h-1.5 rounded-full transition-all duration-500 relative"
                  style={{ width: `${(clientProgress / currentTrack.duration_ms) * 100}%` }}
                >
                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 
                              bg-primary rounded-full border-2 border-primary "
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-text-secondary">
                <span>{handlers.formatTime(clientProgress)}</span>
                <span>{handlers.formatTime(currentTrack.duration_ms)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#101113]">
      <div className="max-w-[2160px] mx-auto px-8 py-8">
        <div className="max-w mx-auto">
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <PiVinylRecord className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-white">Song Requests</h1>
                <p className="text-text-secondary">Play songs on my speaker in my room</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {user?.roles?.includes('dj') && (
                <button
                  onClick={handleSpotifyAuth}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white 
                           transition-colors text-sm"
                >
                  Connect Spotify Account
                </button>
              )}
              <div className="flex items-center gap-2 text-text-secondary text-sm">
                <FiClock className="w-4 h-4" />
                <span>Refreshing in <span className="text-white">{refreshTimer}s</span></span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-status-error/10 border border-status-error/20 rounded-lg 
                          flex items-center gap-3 text-status-error">
              <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg 
                          flex items-center gap-3 text-green-500">
              <FiCheck className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="grid grid-cols-[3fr_2fr] gap-8">
            {/* Left Column - Track Input and Now Playing */}
            <div className="space-y-8">
              {/* Add Track Section */}
              <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="trackUrl" className="block text-md font-medium text-white mb-2">
                      Request a Song
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

                {/* Search Section */}
                <div className="mt-8 pt-5 border-t border-white/5">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div>
                      <label htmlFor="search" className="block text-md font-medium text-white mb-2">
                        Search Songs
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="search"
                          placeholder="Search songs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-surface-2/50 text-text-primary pl-4 pr-10 py-2 rounded-md 
                                  border border-white/5 placeholder:text-text-secondary/50
                                  focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={handleCloseSearch}
                            className="absolute right-9 top-1/2 -translate-y-1/2 p-1.5 
                                    text-text-secondary hover:text-white transition-colors"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSearching || !searchQuery.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 
                                  text-text-secondary hover:text-white transition-colors
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSearching ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiSearch className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Search Results with Close Button */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="relative mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-text-secondary">
                          Search Results
                        </div>
                        <button
                          onClick={handleCloseSearch}
                          className="text-text-secondary hover:text-white transition-colors text-sm 
                                  flex items-center gap-1"
                        >
                          <span>Close</span>
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {searchResults.map((track) => (
                          <div 
                            key={track.id} 
                            className="flex items-center justify-between gap-4 p-3 bg-surface-2/50 
                                    hover:bg-surface-2 rounded-md transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <img 
                                src={track.album.images[track.album.images.length - 1]?.url || 'https://via.placeholder.com/40'}
                                alt={track.name}
                                className="w-10 h-10 rounded object-cover"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-white truncate">
                                  {track.name}
                                </div>
                                <div className="text-xs text-text-secondary truncate">
                                  {track.artists.map(a => a.name).join(', ')}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setTrackUrl(`https://open.spotify.com/track/${track.id}`);
                                handleCloseSearch();
                              }}
                              className="px-3 py-1 text-xs bg-primary/10 hover:bg-primary/20 
                                      text-primary rounded-full transition-colors"
                            >
                              Add to Queue
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            {/* Now Playing Section */}
            <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <AiOutlineSound className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-white">Now Playing</h2>
                </div>
                {user?.roles?.includes('dj') && !spotifyProfile && (
                  <button
                    onClick={handleSpotifyAuth}
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover rounded text-sm text-white 
                            transition-colors flex items-center gap-2"
                  >
                    <SlSocialSpotify className="w-4 h-4" />
                    Connect Spotify
                  </button>
                )}
              </div>
              
              {isLoading.current ? (
                <div className="flex items-center justify-center py-8">
                  <FiLoader className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : currentTrack ? (
                <>
                  <NowPlaying 
                    currentTrack={currentTrack}
                    playbackState={playbackState}
                    clientProgress={clientProgress}
                    user={user}
                    handlers={{
                      formatTime,
                      handleVolumeChange,
                      handlePlaybackControl,
                      isLoading,
                      controlsDisabled
                    }}
                    requestedBy={currentTrack ? requestedSongs.get(currentTrack.id)?.user || null : null}
                  />
                  {spotifyProfile && <SpotifyProfile profile={spotifyProfile} />}
                </>
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  {spotifyProfile ? 'No track playing' : 'Host has gone offline'}
                </div>
              )}
            </div>
          </div>

            {/* Right Column - Queue */}
            <div>
              <div className="bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6 sticky top-8">
                <div className="flex items-center gap-2 mb-6">
                  <PiQueue className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-bold text-white">Coming Up Next</h2>
                </div>
                {isLoading.queue ? (
                  <div className="flex items-center justify-center py-8">
                    <FiLoader className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : queuedTracks.length > 0 ? (
                  <div className="space-y-4 max-h-[calc(35vh-3rem)] overflow-y-auto">
                    {queuedTracks.map((item) => {
                      const mediaDetails = getMediaDetails(item);
                      
                      if (!mediaDetails) {
                        console.warn('Invalid media data:', item);
                        return null;
                      }

                      // Get the smallest image URL or use fallback
                      const imageUrl = mediaDetails.album.images.reduce((smallest, current) => {
                        if (!smallest || current.height < smallest.height) {
                          return current;
                        }
                        return smallest;
                      }, null)?.url || 'https://via.placeholder.com/64';

                      return (
                        <div key={mediaDetails.id} className="flex items-center justify-between gap-4 p-4 bg-surface-2/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <img 
                              src={imageUrl}
                              alt={mediaDetails.name}
                              className="w-12 h-12 rounded" 
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/64';
                              }}
                            />
                            <div>
                              <div className="text-white font-medium">{mediaDetails.name}</div>
                              <div className="text-text-secondary text-sm">
                                {mediaDetails.artists.map(a => a.name).join(', ')}
                                {mediaDetails.type === 'episode' && (
                                  <span className="ml-2 text-xs px-2 py-0.5 bg-surface-2 rounded-full">
                                    Episode
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {requestedSongs.has(mediaDetails.id) ? (
                              <div className="flex items-center gap-2">
                                <div className="text-white text-sm flex items-center gap-1">
                                  Queued by <UserWithVerified user={requestedSongs.get(mediaDetails.id).user} />
                                </div>
                                {requestedSongs.get(mediaDetails.id).user.avatar ? (
                                  <img 
                                    src={requestedSongs.get(mediaDetails.id).user.avatar}
                                    alt={requestedSongs.get(mediaDetails.id).user.username}
                                    className="w-6 h-6 rounded-full"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center">
                                    {requestedSongs.get(mediaDetails.id).user.username[0].toUpperCase()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-text-secondary text-sm">
                                <span>Automatic from Spotify</span>
                                <SlSocialSpotify className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      Queue is empty
                    </div>
                  )}
                </div>
                {/* Recently Played Section */}
                <div className="mt-8 bg-surface-1/50 backdrop-blur-sm rounded-lg border border-white/5 p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <PiClockCounterClockwise className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-white">Recently Played</h2>
                  </div>
                  {isLoading.recent ? (
                    <div className="flex items-center justify-center py-8">
                      <FiLoader className="w-6 h-6 text-primary animate-spin" />
                    </div>
                  ) : recentlyPlayed.length > 0 ? (
                    <div className="space-y-4 max-h-[calc(35vh-3rem)] overflow-y-auto">
                      {recentlyPlayed.map((track) => {
                        // Skip invalid tracks and add more thorough validation
                        if (!track?.id || !track?.album?.images?.length || !track?.name || !track?.artists) {
                          console.warn('Invalid track data:', track);
                          return null;
                        }

                        // Get the smallest image URL or use fallback
                        const imageUrl = track.album.images.reduce((smallest, current) => {
                          if (!smallest || current.height < smallest.height) {
                            return current;
                          }
                          return smallest;
                        }, null)?.url || 'https://via.placeholder.com/64';

                        return (
                          <div key={track.id} className="flex items-center justify-between gap-4 p-4 bg-surface-2/50 rounded-lg">
                            {/* Left side with track info */}
                            <div className="flex items-center gap-4">
                              <img 
                                src={imageUrl}
                                alt={track.name}
                                className="w-12 h-12 rounded" 
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/64';
                                }}
                              />
                              <div>
                                <div className="text-white font-medium">{track.name}</div>
                                <div className="text-text-secondary text-sm">
                                  {track.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                                </div>
                              </div>
                            </div>

                            {/* Right side with requester info and date */}
                            <div className="flex items-center gap-4">
                              {/* Only show requester info if track was queued by a user */}
                              {track.requestedBy && (
                                <div className="flex items-center gap-2">
                                  <div className="text-white text-sm text-right flex items-center gap-1">
                                    Queued by <UserWithVerified user={track.requestedBy} />
                                  </div>
                                  {track.requestedBy.avatar ? (
                                    <img 
                                      src={track.requestedBy.avatar}
                                      alt={track.requestedBy.username}
                                      className="w-6 h-6 rounded-full"
                                    />
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-surface-2 flex items-center justify-center">
                                      {track.requestedBy.username[0].toUpperCase()}
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="text-text-secondary text-xs">
                                {new Date(track.played_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-text-secondary">
                      No recently played tracks
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Spotify;