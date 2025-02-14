import SpotifyToken from '../models/SpotifyToken.js';

const REFRESH_INTERVAL = 20; // seconds

export const refreshTokenIfNeeded = async (spotifyApi) => {
  try {
    const tokens = await SpotifyToken.findOne().sort({ createdAt: -1 });
    
    if (!tokens) {
      throw new Error('No Spotify tokens found. Please authenticate first.');
    }

    if (tokens.expiresAt <= new Date()) {
      spotifyApi.setRefreshToken(tokens.refreshToken);
      const data = await spotifyApi.refreshAccessToken();
      
      await SpotifyToken.create({
        accessToken: data.body['access_token'],
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + data.body['expires_in'] * 1000),
        lastRefresh: new Date()
      });

      spotifyApi.setAccessToken(data.body['access_token']);
    } else {
      spotifyApi.setAccessToken(tokens.accessToken);
      spotifyApi.setRefreshToken(tokens.refreshToken);
    }
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

export const updateQueueTimestamp = async () => {
  try {
    const tokens = await SpotifyToken.findOne().sort({ createdAt: -1 });
    if (tokens) {
      tokens.lastQueueUpdate = new Date();
      await tokens.save();
    }
  } catch (error) {
    console.error('Error updating queue timestamp:', error);
  }
};

export const updateRecentlyPlayedTimestamp = async () => {
  try {
    const timestamp = new Date();
    await SpotifyToken.findOneAndUpdate(
      {},
      { $set: { lastRecentlyPlayedUpdate: timestamp } },
      { sort: { createdAt: -1 } }
    );
    return timestamp;
  } catch (error) {
    console.error('Error updating recently played timestamp:', error);
    throw error;
  }
};

export const getTimeUntilNextRefresh = async () => {
  try {
    const tokens = await SpotifyToken.findOne().sort({ createdAt: -1 });
    if (!tokens?.lastQueueUpdate) return 0;

    const now = new Date();
    const timeSinceUpdate = (now - tokens.lastQueueUpdate) / 1000;
    return Math.max(0, REFRESH_INTERVAL - timeSinceUpdate);
  } catch (error) {
    console.error('Error calculating refresh time:', error);
    return 0;
  }
};

export const updateRefreshTimestamp = async () => {
  try {
    const tokens = await SpotifyToken.findOne().sort({ createdAt: -1 });
    if (!tokens) return;
    
    await SpotifyToken.findByIdAndUpdate(tokens._id, {
      lastRefresh: new Date()
    });
  } catch (error) {
    console.error('Error updating refresh timestamp:', error);
  }
};