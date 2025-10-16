// Imports
const { Progress, ProfileInteraction } = require("./ProfileInteraction.js");

// Helper functions
// Get or create profile interactions entry
async function getOrCreateProfileInteractions(userId, profileId) {
  try {
    // Try to find existing entry
    let interactions = await ProfileInteraction.findOne({ userId, profileId });

    // If doesn't exist, create new one
    if (!interactions) {
      interactions = new ProfileInteraction({
        userId,
        profileId,
        likes: [],
        progress: [],
      });
      await interactions.save();
    }

    return interactions;
  } catch (error) {
    throw error;
  }
}

// Main functions
// Add content to profile likes
async function addToProfileLikes(userId, profileId, contentId) {
  try {
    // Get or create the document
    const interactions = await getOrCreateProfileInteractions(
      userId,
      profileId
    );

    // Check if already liked
    const alreadyLiked = interactions.likes.includes(contentId);

    if (!alreadyLiked) {
      // Add to likes array
      interactions.likes.push(contentId);
      await interactions.save();
    }

    return {
      success: true,
      alreadyLiked,
      message: alreadyLiked ? "Already liked" : "Added to likes",
    };
  } catch (error) {
    throw error;
  }
}

// Remove content from profile likes
async function removeFromProfileLikes(userId, profileId, contentId) {
  try {
    const interactions = await ProfileInteraction.findOne({
      userId,
      profileId,
    });

    if (!interactions) {
      return { success: false, message: "Profile interactions not found" };
    }

    // Remove from likes array
    interactions.likes = interactions.likes.filter(
      (id) => id !== contentId
    );
    await interactions.save();

    return {
      success: true,
      message: "Removed from likes",
    };
  } catch (error) {
    throw error;
  }
}

// Add content to profile watched
async function addToProfileWatched(userId, profileId, contentId, contentType, contentSeason, contentEpisode) {
  try {
    // Get or create the document
    const interactions = await getOrCreateProfileInteractions(
      userId,
      profileId
    );

    // Check if already watched (for movies) or already watched this episode (for shows)
    let alreadyWatched;
    if (contentType === 'movie') {
      alreadyWatched = interactions.progress.some(item => 
        item.contentId === contentId && item.type === 'movie'
      );
    } else {
      alreadyWatched = interactions.progress.some(item => 
        item.contentId === contentId && 
        item.type === 'show' &&
        item.season === contentSeason && 
        item.episode === contentEpisode
      );
    }

    if (!alreadyWatched) {
      // Create new progress entry
      const newProgress = {
        contentId,
        type: contentType, // Field is called 'type' in schema, not 'contentType'
        lastPositionSec: 0,
        isCompleted: false,
        updatedAt: new Date()
      };

      // Add season and episode only for shows
      if (contentType === 'show') {
        newProgress.season = contentSeason;
        newProgress.episode = contentEpisode;
      }

      // Add to profile interaction
      interactions.progress.push(newProgress);

      // Save 
      await interactions.save();
    }

    return {
      success: true,
      alreadyWatched,
      message: alreadyWatched ? "Already watched" : "Added to watched",
    };
  } catch (error) {
    throw error;
  }
}

// Get profile interactions
async function getProfileInteractions(userId, profileId) {
  try {
    const interactions = await ProfileInteraction.findOne({
      userId,
      profileId,
    });

    if (!interactions) {
      // Return empty interactions if document doesn't exist
      return {
        userId,
        profileId,
        likes: [],
        progress: [],
      };
    }

    return interactions;
  } catch (error) {
    throw error;
  }
}

// Toggle like
async function toggleProfileLike(userId, profileId, contentId) {
  try {
    const interactions = await getOrCreateProfileInteractions(
      userId,
      profileId
    );
    const isCurrentlyLiked = interactions.likes.includes(contentId);

    let result;
    if (isCurrentlyLiked) {
      // Use existing remove function
      result = await removeFromProfileLikes(userId, profileId, contentId);
    } else {
      // Use existing add function
      result = await addToProfileLikes(userId, profileId, contentId);
    }

    return {
      success: result.success,
      isLiked: !isCurrentlyLiked,
      message: isCurrentlyLiked ? "Removed from likes" : "Added to likes",
    };
  } catch (error) {
    throw error;
  }
}

// Delete all interactions for a profile
async function deleteProfileInteractions(userId, profileId) {
  try {
    const result = await ProfileInteraction.deleteOne({ userId, profileId });
    return {
      success: true,
      deleted: result.deletedCount > 0,
      message: result.deletedCount > 0 ? "Profile interactions deleted" : "No interactions found to delete",
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getOrCreateProfileInteractions,
  addToProfileLikes,
  removeFromProfileLikes,
  addToProfileWatched,
  getProfileInteractions,
  toggleProfileLike,
  deleteProfileInteractions,
};
