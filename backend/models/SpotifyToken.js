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
  },
  lastRefresh: {
    type: Date,
    default: Date.now
  },
  lastQueueUpdate: {
    type: Date,
    default: Date.now
  },
  queuedTracks: [{
    trackId: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

export default mongoose.model('SpotifyToken', spotifyTokenSchema);