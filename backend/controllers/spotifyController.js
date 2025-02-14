import SpotifyWebApi from 'spotify-web-api-node';
import SpotifyToken from '../models/SpotifyToken.js';
import axios from 'axios';
import { 
    refreshTokenIfNeeded, 
    getTimeUntilNextRefresh, 
    updateQueueTimestamp,
    updateRecentlyPlayedTimestamp
  } from '../utils/spotifyUtils.js';

const spotifyApi = new SpotifyWebApi({
  clientId: process***REMOVED***.SPOTIFY_CLIENT_ID,
  clientSecret: process***REMOVED***.SPOTIFY_CLIENT_SECRET,
  redirectUri: process***REMOVED***.SPOTIFY_REDIRECT_URI
});

// Admin auth endpoint (only you should use this)
export const getSpotifyAuth = async (req, res) => {
    const scopes = [
        'user-modify-playback-state', 
        'user-read-playback-state',
        'user-read-currently-playing',
        'user-read-recently-played'
      ];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
};

const makeSpotifyRequest = async (endpoint, method = 'GET', body = null) => {
  const tokens = await SpotifyToken.findOne().sort({ createdAt: -1 });
  
  if (!tokens) {
    throw new Error('No Spotify tokens found. Please authenticate first.');
  }

  // Refresh token if needed
  if (tokens.expiresAt <= new Date()) {
    await refreshTokenIfNeeded(spotifyApi);
    // Get fresh tokens after refresh
    tokens = await SpotifyToken.findOne().sort({ createdAt: -1 });
  }

  try {
    const config = {
      method,
      url: `https://api.spotify.com/v1${endpoint}`,
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`
      }
    };

    // Only add Content-Type and body for POST/PUT requests
    if (method !== 'GET' && body) {
      config.headers['Content-Type'] = 'application/json';
      config.data = body;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Spotify API request error:', error.response?.data || error.message);
    throw error;
  }
};

export const handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    // Save tokens to database
    await SpotifyToken.create({
      accessToken: data.body['access_token'],
      refreshToken: data.body['refresh_token'],
      expiresAt: new Date(Date.now() + data.body['expires_in'] * 1000)
    });
    
    res.redirect('/spotify');
  } catch (error) {
    console.error('Spotify auth error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Public endpoints (no auth required)
export const getCurrentTrack = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const [playbackState, currentTrack] = await Promise.all([
      spotifyApi.getMyCurrentPlaybackState(),
      spotifyApi.getMyCurrentPlayingTrack()
    ]);
    
    res.json({
      item: currentTrack.body?.item || null,
      device: playbackState.body?.device || null,
      progress_ms: playbackState.body?.progress_ms || 0,
      volume_percent: playbackState.body?.device?.volume_percent || 0,
      is_playing: playbackState.body?.is_playing || false
    });
  } catch (error) {
    console.error('Get current track error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getQueuedTracks = async (req, res) => {
    try {
      await refreshTokenIfNeeded(spotifyApi);
      const data = await makeSpotifyRequest('/me/player/queue');
      const timeUntilRefresh = await getTimeUntilNextRefresh();
  
      // Get queue information with user details
      const token = await SpotifyToken.findOne().sort({ createdAt: -1 })
        .populate('queuedTracks.userId', 'username avatar handle');
  
      const queueWithUsers = data?.queue?.map(track => {
        const queueInfo = token.queuedTracks.find(qt => qt.trackId === track.id);
        return {
          ...track,
          requestedBy: queueInfo?.userId || null
        };
      }) || [];
  
      res.json({ 
        queue: queueWithUsers,
        refreshIn: Math.round(timeUntilRefresh),
        nextRefresh: new Date(Date.now() + timeUntilRefresh * 1000).toISOString()
      });
    } catch (error) {
        console.error('Queue error:', error);
    
    if (error.response?.status === 404 || error.response?.status === 204) {
      return res.json({ queue: [] });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        message: 'Spotify authentication required' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch queue',
      error: error.response?.data?.error?.message || error.message 
    });
  }
};

export const addToQueue = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const { trackUrl } = req.body;
    
    const trackId = extractTrackId(trackUrl);
    if (!trackId) {
      return res.status(400).json({ message: 'Invalid Spotify track URL' });
    }

    const trackInfo = await spotifyApi.getTrack(trackId);
    await spotifyApi.addToQueue(`spotify:track:${trackId}`);
    
    // Store queue information
    const token = await SpotifyToken.findOne().sort({ createdAt: -1 });
    token.queuedTracks.push({
      trackId: trackInfo.body.id,
      userId: req.user._id
    });
    await token.save();
    
    await updateQueueTimestamp();

    res.json({ 
      message: 'Track added to queue',
      track: trackInfo.body,
      user: req.user ? {
        id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        handle: req.user.handle
      } : null
    });
  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Helper function to extract track ID from Spotify URL
const extractTrackId = (url) => {
  try {
    const trackUrl = new URL(url);
    if (!trackUrl.hostname.includes('spotify.com')) return null;
    
    const pathParts = trackUrl.pathname.split('/');
    if (pathParts.includes('track')) {
      return pathParts[pathParts.indexOf('track') + 1].split('?')[0];
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Adjust device volume
export const adjustVolume = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const { volume } = req.body;
    await spotifyApi.setVolume(volume);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Play, pause, next, previous controls
export const controlPlayback = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const { action } = req.body;
    
    switch (action) {
      case 'play':
        await spotifyApi.play();
        break;
      case 'pause':
        await spotifyApi.pause();
        break;
      case 'next':
      case 'previous':
        // First perform the action
        await (action === 'next' ? spotifyApi.skipToNext() : spotifyApi.skipToPrevious());
        
        // Wait for Spotify to update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get current track to add to recently played
        const currentTrack = await spotifyApi.getMyCurrentPlayingTrack();
        if (currentTrack.body?.item) {
          // Update timestamps and add to recently played
          await Promise.all([
            updateQueueTimestamp(),
            updateRecentlyPlayedTimestamp(),
            SpotifyToken.findOneAndUpdate(
              {},
              {
                $push: {
                  recentlyPlayed: {
                    track: currentTrack.body.item,
                    played_at: new Date()
                  }
                }
              },
              { sort: { createdAt: -1 } }
            )
          ]);
        }
        break;
      default:
        throw new Error('Invalid action');
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Playback control error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getRecentlyPlayed = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    
    // Get recently played from both Spotify API and our database
    const [spotifyData, localData] = await Promise.all([
      spotifyApi.getMyRecentlyPlayedTracks({ limit: 10 }),
      SpotifyToken.findOne().sort({ createdAt: -1 })
    ]);

    // Combine and sort both sources
    const spotifyTracks = spotifyData.body.items.map(item => ({
      ...item.track,
      played_at: new Date(item.played_at).toISOString()
    }));

    const localTracks = localData?.recentlyPlayed?.map(item => ({
      ...item.track,
      played_at: item.played_at.toISOString()
    })) || [];

    // Combine both sources, remove duplicates, and sort by played_at
    const allTracks = [...spotifyTracks, ...localTracks]
      .reduce((acc, current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc.map(item => 
            item.id === current.id
              ? (new Date(item.played_at) > new Date(current.played_at) ? item : current)
              : item
          );
        }
      }, [])
      .sort((a, b) => new Date(b.played_at) - new Date(a.played_at))
      .slice(0, 10);

    res.json({ tracks: allTracks });
  } catch (error) {
    console.error('Get recently played error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getSpotifyProfile = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const data = await spotifyApi.getMe();
    res.json({
      profile: {
        id: data.body.id,
        name: data.body.display_name,
        image: data.body.images?.[0]?.url,
        uri: data.body.uri,
        followers: data.body.followers.total,
        product: data.body.product,
        url: data.body.external_urls.spotify
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: error.message });
  }
};