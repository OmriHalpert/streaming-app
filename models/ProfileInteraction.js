// Interactions related schemas
const mongoose = require("mongoose");

// Single progress schema
const progressSchema = mongoose.Schema(
  {
    contentId: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ["movie", "show"],
      required: true
    },
    lastPositionSec: {
      type: Number,
      min: 0,
      default: 0
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    season: {
      type: Number,
      min: 1
    },
    episode: {
      type: Number,
      min: 1
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
      {
      _id: false
    }
)

// Profile Interactions schema
const profileInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: Number,
      required: true,
    },
    profileId: {
      type: Number,
      required: true,
    },
    likes: [
      {
        type: Number,
      },
    ],
    progress: [
      progressSchema
    ],
  },
  {
    collection: "profile_interactions",
    timestamps: true
  }
);

// Unique constraint - one document per profile
profileInteractionSchema.index({ userId: 1, profileId: 1 }, { unique: true });

// Prevents duplicate movie progress (profile, content)
ProfileInteractionSchema.index(
  { profileId: 1, "progress.contentId": 1, "progress.type": 1 },
  { partialFilterExpression: { "progress.type": "movie" } }
);

// Prevent duplicate episode progress per (profile, content, season, episode)
ProfileInteractionSchema.index(
  {
    profileId: 1,
    "progress.contentId": 1,
    "progress.type": 1,
    "progress.season": 1,
    "progress.episode": 1,
  },
  { partialFilterExpression: { "progress.type": "show" } }
);

// Create indexes for better performance
profileInteractionSchema.index({ userId: 1 });
profileInteractionSchema.index({ profileId: 1 });

// Create and export the model
const ProfileInteraction = mongoose.model(
  "ProfileInteraction",
  profileInteractionSchema
);

module.exports = ProfileInteraction;
