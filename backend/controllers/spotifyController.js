import SpotifyWebApi from 'spotify-web-api-node';
import SpotifyToken from '../models/SpotifyToken.js';
import { refreshTokenIfNeeded } from '../utils/spotifyUtils.js';

const spotifyApi = new SpotifyWebApi({
  clientId: process***REMOVED***.SPOTIFY_CLIENT_ID,
  clientSecret: process***REMOVED***.SPOTIFY_CLIENT_SECRET,
  redirectUri: process***REMOVED***.SPOTIFY_REDIRECT_URI
});

// Admin auth endpoint (only you should use this)
export const getSpotifyAuth = async (req, res) => {
  const scopes = ['user-modify-playback-state', 'user-read-playback-state'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
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
    const data = await spotifyApi.getMyQueue();
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToQueue = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const { trackUrl } = req.body;
    
    // Extract track ID from URL
    const trackId = extractTrackId(trackUrl);
    if (!trackId) {
      return res.status(400).json({ message: 'Invalid Spotify track URL' });
    }

    await spotifyApi.addToQueue(`spotify:track:${trackId}`);
    res.json({ message: 'Track added to queue' });
  } catch (error) {
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