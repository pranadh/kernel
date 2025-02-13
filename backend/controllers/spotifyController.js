import SpotifyWebApi from 'spotify-web-api-node';
import SpotifyToken from '../models/SpotifyToken.js';
import axios from 'axios';
import { 
    refreshTokenIfNeeded, 
    getTimeUntilNextRefresh, 
    updateQueueTimestamp 
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
        'user-read-currently-playing'
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
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    res.json(data.body);
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