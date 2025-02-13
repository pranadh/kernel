import SpotifyToken from '../models/SpotifyToken.js';

export const refreshTokenIfNeeded = async (spotifyApi) => {
  try {
    // Get latest tokens
    const tokens = await SpotifyToken.findOne().sort({ createdAt: -1 });
    
    if (!tokens) {
      throw new Error('No Spotify tokens found. Please authenticate first.');
    }

    // Check if token is expired or about to expire
    if (tokens.expiresAt <= new Date()) {
      spotifyApi.setRefreshToken(tokens.refreshToken);
      const data = await spotifyApi.refreshAccessToken();
      
      // Save new tokens
      await SpotifyToken.create({
        accessToken: data.body['access_token'],
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + data.body['expires_in'] * 1000)
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