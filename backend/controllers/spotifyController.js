import SpotifyWebApi from 'spotify-web-api-node';
import SpotifyToken from '../models/SpotifyToken.js';
import { refreshTokenIfNeeded } from '../utils/spotifyUtils.js';
import axios from 'axios';

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
    const data = await makeSpotifyRequest('/me/player/queue');
    
    // Spotify returns null for queue if nothing is playing
    if (!data?.queue) {
      return res.json({ queue: [] });
    }
    
    res.json({ queue: data.queue });
  } catch (error) {
    console.error('Queue error:', error);
    
    // Handle specific error cases
    if (error.response?.status === 404 || error.response?.status === 204) {
      return res.json({ queue: [] });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        message: 'Spotify authentication required. Please try again.' 
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

    // Get track info before adding to queue
    const trackInfo = await spotifyApi.getTrack(trackId);
        
    // Add to queue
    await spotifyApi.addToQueue(`spotify:track:${trackId}`);
    
    // Return success with track and user info (with null checks)
    res.json({ 
      message: 'Track added to queue',
      track: trackInfo.body,
      user: req.user ? {
        id: req.user._id,
        username: req.user.username,
        avatar: req.user.avatar,
        handle: req.user.handle
      } : {
        id: 'anonymous',
        username: 'Anonymous',
        avatar: null,
        handle: null
      }
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