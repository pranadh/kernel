import mongoose from 'mongoose';

const spotifyTokenSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('SpotifyToken', spotifyTokenSchema);