import SpotifyWebApi from 'spotify-web-api-node';
import { refreshTokenIfNeeded } from '../utils/spotifyUtils.js';

const spotifyApi = new SpotifyWebApi({
  clientId: process***REMOVED***.SPOTIFY_CLIENT_ID,
  clientSecret: process***REMOVED***.SPOTIFY_CLIENT_SECRET,
  redirectUri: process***REMOVED***.SPOTIFY_REDIRECT_URI
});

let accessToken = null;
let refreshToken = null;

export const getSpotifyAuth = async (req, res) => {
  const scopes = ['user-modify-playback-state', 'user-read-playback-state'];
  const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
  res.json({ url: authorizeURL });
};

export const handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    const data = await spotifyApi.authorizationCodeGrant(code);
    
    accessToken = data.body['access_token'];
    refreshToken = data.body['refresh_token'];
    
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);
    
    res.redirect('/spotify');
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addToQueue = async (req, res) => {
  try {
    const { trackId } = req.body;
    await spotifyApi.addToQueue(`spotify:track:${trackId}`);
    res.json({ message: 'Track added to queue' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCurrentTrack = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    res.json(data.body);
  } catch (error) {
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

export const searchTracks = async (req, res) => {
  try {
    await refreshTokenIfNeeded(spotifyApi);
    const { q } = req.query;
    const data = await spotifyApi.searchTracks(q);
    res.json(data.body);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};