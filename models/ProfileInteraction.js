// Interactions related schemas
const mongoose = require("mongoose");

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
    profileLikes: [
      {
        type: String,
        default: [],
      },
    ],
    profileWatched: [
      {
        type: String,
        default: [],
      },
    ],
  },
  {
    collection: "profile_interactions",
  }
);

// Unique constraint - one document per profile
profileInteractionSchema.index({ userId: 1, profileId: 1 }, { unique: true });

// Create indexes for better performance
profileInteractionSchema.index({ userId: 1 });
profileInteractionSchema.index({ profileId: 1 });

// Create and export the model
const ProfileInteraction = mongoose.model(
  "ProfileInteraction",
  profileInteractionSchema
);

module.exports = ProfileInteraction;
