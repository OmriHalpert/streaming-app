const profileInteractionModel = require('../models/profileInteractionModel');

// Toggle like for a content item
async function toggleContentLike(userId, profileId, contentName) {
    try {
        // Validate inputs
        if (!userId || !profileId || !contentName) {
            throw new Error('User ID, profile ID, and content name are required');
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
            throw new Error('User ID, profile ID, and content name are required');
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
            throw new Error('User ID and profile ID are required');
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

// Check if content is liked by profile
async function isContentLiked(userId, profileId, contentName) {
    try {
        const interactions = await getProfileInteractions(userId, profileId);
        return interactions.profileLikes.includes(contentName);
    } catch (error) {
        throw error;
    }
}

// Check if content is watched by profile
async function isContentWatched(userId, profileId, contentName) {
    try {
        const interactions = await getProfileInteractions(userId, profileId);
        return interactions.profileWatched.includes(contentName);
    } catch (error) {
        throw error;
    }
}

// Get all liked content for a profile
async function getProfileLikes(userId, profileId) {
    try {
        const interactions = await getProfileInteractions(userId, profileId);
        return interactions.profileLikes;
    } catch (error) {
        throw error;
    }
}

// Get all watched content for a profile
async function getProfileWatched(userId, profileId) {
    try {
        const interactions = await getProfileInteractions(userId, profileId);
        return interactions.profileWatched;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    toggleContentLike,
    markContentAsWatched,
    getProfileInteractions,
    isContentLiked,
    isContentWatched,
    getProfileLikes,
    getProfileWatched
};