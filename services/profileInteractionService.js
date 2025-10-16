// Imports
const profileInteractionModel = require("../models/profileInteractionModel");

// Main functions
// Toggle like for a content item
async function toggleContentLike(userId, profileId, contentId) {
  try {
    // Validate inputs
    if (!userId || !profileId || !contentId) {
      throw new Error("User ID, profile ID, and content ID are required");
    }

    const result = await profileInteractionModel.toggleProfileLike(
      parseInt(userId),
      parseInt(profileId),
      parseInt(contentId)
    );

    return result;
  } catch (error) {
    throw error;
  }
}

// Mark content as watched
async function markContentAsWatched(userId, profileId, contentId, contentType, contentSeason, contentEpisode) {
  try {
    // Validate required inputs
    if (!userId || !profileId || !contentId || !contentType) {
      throw new Error("User ID, profile ID, content ID, and content type are required");
    }

    // For TV shows, season and episode are required
    if (contentType === 'show' && (!contentSeason || !contentEpisode)) {
      throw new Error("Season and episode numbers are required for TV shows");
    }

    const result = await profileInteractionModel.addToProfileWatched(
      parseInt(userId),
      parseInt(profileId),
      parseInt(contentId),
      contentType,
      contentSeason ? parseInt(contentSeason) : null,
      contentEpisode ? parseInt(contentEpisode) : null
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
