export const refreshTokenIfNeeded = async (spotifyApi) => {
  if (!spotifyApi.getAccessToken()) {
    throw new Error('No access token available');
  }

  try {
    const data = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(data.body['access_token']);
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};