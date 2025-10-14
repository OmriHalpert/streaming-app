// Imports
const profileInteractionModel = require("../models/profileInteractionModel");

// Main functions
// Toggle like for a content item
async function toggleContentLike(userId, profileId, contentName) {
  try {
    // Validate inputs
    if (!userId || !profileId || !contentName) {
      throw new Error("User ID, profile ID, and content name are required");
    }

    const result = await profileInteractionModel.toggleProfileLike(
      parseInt(userId),
      parseInt(profileId),
      contentName.trim()
    );

    return result;
  } catch (error) {
    throw error;
  }
}

// Mark content as watched
async function markContentAsWatched(userId, profileId, contentName) {
  try {
    // Validate inputs
    if (!userId || !profileId || !contentName) {
      throw new Error("User ID, profile ID, and content name are required");
    }

    const result = await profileInteractionModel.addToProfileWatched(
      parseInt(userId),
      parseInt(profileId),
      contentName.trim()
    );

    return result;
  } catch (error) {
    throw error;
  }
}

// Get profile's interactions (likes and watched)
async function getProfileInteractions(userId, profileId) {
  try {
    // Validate inputs
    if (!userId || !profileId) {
      throw new Error("User ID and profile ID are required");
    }

    const interactions = await profileInteractionModel.getProfileInteractions(
      parseInt(userId),
      parseInt(profileId)
    );

    return interactions;
  } catch (error) {
    throw error;
  }
}

// Delete all interactions for a profile
async function deleteProfileInteractions(userId, profileId) {
  try {
    // Validate inputs
    if (!userId || !profileId) {
      throw new Error("User ID and profile ID are required");
    }

    const result = await profileInteractionModel.deleteProfileInteractions(
      parseInt(userId),
      parseInt(profileId)
    );

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  toggleContentLike,
  markContentAsWatched,
  getProfileInteractions,
  deleteProfileInteractions,
};
