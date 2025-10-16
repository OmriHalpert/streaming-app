// Imports
const ProfileInteraction = require("./ProfileInteraction");

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
        profileLikes: [],
        profileWatched: [],
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
async function addToProfileLikes(userId, profileId, contentName) {
  try {
    // Get or create the document
    const interactions = await getOrCreateProfileInteractions(
      userId,
      profileId
    );

    // Check if already liked
    const alreadyLiked = interactions.profileLikes.includes(contentName);

    if (!alreadyLiked) {
      // Add to likes array
      interactions.profileLikes.push(contentName);
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
async function removeFromProfileLikes(userId, profileId, contentName) {
  try {
    const interactions = await ProfileInteraction.findOne({
      userId,
      profileId,
    });

    if (!interactions) {
      return { success: false, message: "Profile interactions not found" };
    }

    // Remove from likes array
    interactions.profileLikes = interactions.profileLikes.filter(
      (name) => name !== contentName
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
async function addToProfileWatched(userId, profileId, contentName) {
  try {
    // Get or create the document
    const interactions = await getOrCreateProfileInteractions(
      userId,
      profileId
    );

    // Check if already watched
    const alreadyWatched = interactions.profileWatched.includes(contentName);

    if (!alreadyWatched) {
      // Add to watched array
      interactions.profileWatched.push(contentName);
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
        profileLikes: [],
        profileWatched: [],
      };
    }

    return interactions;
  } catch (error) {
    throw error;
  }
}

// Toggle like
async function toggleProfileLike(userId, profileId, contentName) {
  try {
    const interactions = await getOrCreateProfileInteractions(
      userId,
      profileId
    );
    const isCurrentlyLiked = interactions.profileLikes.includes(contentName);

    let result;
    if (isCurrentlyLiked) {
      // Use existing remove function
      result = await removeFromProfileLikes(userId, profileId, contentName);
    } else {
      // Use existing add function
      result = await addToProfileLikes(userId, profileId, contentName);
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
