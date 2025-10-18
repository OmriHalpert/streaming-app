// Imports
const profileInteractionModel = require("../models/profileInteractionModel");
const { ProfileInteraction } = require("../models/ProfileInteraction");

// Main functions
// Save watch progress
async function saveProgress(userId, profileId, contentId, contentType, lastPositionSec, isCompleted, season, episode) {
  try {
    if (!userId || !profileId || !contentId || !contentType || lastPositionSec === undefined) {
      throw new Error("Missing required fields");
    }

    if (contentType === 'show' && (!season || !episode)) {
      throw new Error("Season and episode required for shows");
    }

    const result = await profileInteractionModel.updateProgress(
      parseInt(userId),
      parseInt(profileId),
      parseInt(contentId),
      contentType,
      parseInt(lastPositionSec),
      Boolean(isCompleted),
      season ? parseInt(season) : null,
      episode ? parseInt(episode) : null
    );

    return result;
  } catch (error) {
    throw error;
  }
}

// Get watch progress
async function getProgress(userId, profileId, contentId, contentType, season, episode) {
  try {
    if (!userId || !profileId || !contentId || !contentType) {
      throw new Error("Missing required fields");
    }

    const progress = await profileInteractionModel.getProgress(
      parseInt(userId),
      parseInt(profileId),
      parseInt(contentId),
      contentType,
      season ? parseInt(season) : null,
      episode ? parseInt(episode) : null
    );

    return progress;
  } catch (error) {
    throw error;
  }
}

// Clear watch progress (removes ALL episodes for shows)
async function clearProgress(userId, profileId, contentId, contentType) {
  try {
    if (!userId || !profileId || !contentId || !contentType) {
      throw new Error("Missing required fields");
    }

    const result = await profileInteractionModel.clearProgress(
      parseInt(userId),
      parseInt(profileId),
      parseInt(contentId),
      contentType
    );

    return result;
  } catch (error) {
    throw error;
  }
}

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

// Get most popular content based on view count
async function getMostPopularContent(limit = 10) {
  try {
    // Aggregate to count views per content
    const popularContent = await ProfileInteraction.aggregate([
      // Unwind the progress array to get individual progress records
      { $unwind: "$progress" },
      
      // Group by contentId and count occurrences
      {
        $group: {
          _id: "$progress.contentId",
          viewCount: { $sum: 1 }
        }
      },
      
      // Sort by viewCount descending (most viewed first)
      { $sort: { viewCount: -1 } },
      
      // Limit to top N
      { $limit: parseInt(limit) },
      
      // Reshape the output
      {
        $project: {
          _id: 0,
          contentId: "$_id",
          viewCount: 1
        }
      }
    ]);

    return popularContent;
  } catch (error) {
    console.error("Error getting popular content:", error);
    throw error;
  }
}

module.exports = {
  saveProgress,
  getProgress,
  clearProgress,
  toggleContentLike,
  markContentAsWatched,
  getProfileInteractions,
  deleteProfileInteractions,
  getMostPopularContent
};
