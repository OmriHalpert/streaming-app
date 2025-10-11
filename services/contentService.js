const contentModel = require('../models/contentModel');

// Get all content with optional profile-specific like status
async function getAllContent(profileId = null) {
    // Fetch content list
    const content = await contentModel.getContent();

    // No content exists
    if (content.length === 0) {
        throw new Error('No content found');
    }

    // If profileId provided, add isLiked status for that profile
    if (profileId) {
        const profileIdInt = parseInt(profileId);
        return content.map(item => ({
            ...item,
            isLiked: item.profileLikes.includes(profileIdInt)
        }));
    }

    return content;
}

// Get content by name
async function getContentByName(contentName) {
    // Validate content name
    if (!contentName || contentName.trim() === '') {
        throw new Error('Content name is required');
    }

    // Fetch all content
    const content = await contentModel.getContent();
    const foundContent = content.find(item => item.name === contentName.trim());

    if (!foundContent) {
        throw new Error('Content not found');
    }

    return foundContent;
}

// Search content
async function searchContent(query, profileId = null) {
    // Validate search query
    if (!query || query.trim() === '') {
        // Return all content if no query
        return await getAllContent(profileId);
    }

    if (query.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters');
    }

    // Use model search function
    const searchResults = await contentModel.searchContent(query.trim());

    // Add profile-specific like status if profileId provided
    if (profileId) {
        const profileIdInt = parseInt(profileId);
        return searchResults.map(item => ({
            ...item,
            isLiked: item.profileLikes.includes(profileIdInt)
        }));
    }

    return searchResults;
}

// Toggle like
async function toggleContentLike(contentName, profileId) {
    // Validate inputs
    if (!contentName || contentName.trim() === '') {
        throw new Error('Content name is required');
    }

    if (!profileId || isNaN(profileId) || profileId <= 0) {
        throw new Error('Valid profile ID is required');
    }

    // Use model to toggle like
    const result = await contentModel.updateContentLikes(
        contentName.trim(), 
        parseInt(profileId), 
        'toggle'
    );

    return {
        contentName: result.content.name,
        likeCount: result.likeCount,
        isLiked: result.isLiked,
        message: result.isLiked ? 'Content liked' : 'Content unliked'
    };
}

// Get content for feed page (with profile-specific data)
async function getContentForFeed(profileId) {
    // Validate profile ID
    if (!profileId || isNaN(profileId) || profileId <= 0) {
        throw new Error('Valid profile ID is required for feed');
    }

    // Get all content with profile-specific like status
    const content = await getAllContent(parseInt(profileId));

    // Group content by genres
    const genreGroups = {};
    content.forEach(item => {
        item.genre.forEach(genre => {
            if (!genreGroups[genre]) {
                genreGroups[genre] = [];
            }
            // Avoid duplicates
            if (!genreGroups[genre].find(existing => existing.name === item.name)) {
                genreGroups[genre].push(item);
            }
        });
    });

    // Add any additional feed-specific processing here
    return {
        content: content,
        genreGroups: genreGroups,
        totalCount: content.length,
        likedCount: content.filter(item => item.isLiked).length,
        profileId: parseInt(profileId)
    };
}

module.exports = {
    getAllContent,
    getContentByName,
    searchContent,
    toggleContentLike,
    getContentForFeed
};