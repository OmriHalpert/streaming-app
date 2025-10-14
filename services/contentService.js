const contentModel = require('../models/contentModel');
const profileInteractionService = require('./profileInteractionService');

// Get all content with optional profile-specific like/watched status
async function getAllContent(userId = null, profileId = null) {
    // Fetch content list
    const content = await contentModel.getContent();

    // No content exists
    if (content.length === 0) {
        throw new Error('No content found');
    }

    // If userId and profileId provided, add isLiked and isWatched status
    if (userId && profileId) {
        const interactions = await profileInteractionService.getProfileInteractions(userId, profileId);
        
        const transformedContent = content.map(item => ({
            ...item.toObject(), // Convert Mongoose document to plain object
            isLiked: interactions.profileLikes.includes(item.name),
            isWatched: interactions.profileWatched.includes(item.name)
        }));
        
        return transformedContent;
    }

    // Return plain content without interaction status
    const plainContent = content.map(item => ({
        ...item.toObject(),
        isLiked: false,
        isWatched: false
    }));

    return plainContent;
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

// Get content by genre
async function getContentByGenre(genreName, userId = null, profileId = null) {
    // Validate genre name
    if (!genreName || genreName.trim() === '') {
        throw new Error('Genre name is required');
    }

    // Fetch all content
    const content = await contentModel.getContent();
    console.log('Content = ', content);
    const foundContent = content.filter(item => item.genre.includes(genreName));
    console.log('Filtered Content = ', foundContent);

    if (!foundContent || foundContent.length === 0) {
        throw new Error('Content not found');
    }

    // If userId and profileId provided, add isLiked and isWatched status
    if (userId && profileId) {
        const interactions = await profileInteractionService.getProfileInteractions(userId, profileId);
        
        const transformedContent = foundContent.map(item => ({
            ...item.toObject(), // Convert Mongoose document to plain object
            isLiked: interactions.profileLikes.includes(item.name),
            isWatched: interactions.profileWatched.includes(item.name)
        }));
        
        return transformedContent;
    }

    // Return plain content without interaction status
    const plainContent = foundContent.map(item => ({
        ...item.toObject(),
        isLiked: false,
        isWatched: false
    }));

    return plainContent;
}

// Search content
async function searchContent(query, userId = null, profileId = null) {
    // Validate search query
    if (!query || query.trim() === '') {
        // Return all content if no query
        return await getAllContent(userId, profileId);
    }

    if (query.trim().length < 2) {
        throw new Error('Search query must be at least 2 characters');
    }

    // Use model search function
    const searchResults = await contentModel.searchContent(query.trim());

    // Add profile-specific like/watched status if userId and profileId provided
    if (userId && profileId) {
        const interactions = await profileInteractionService.getProfileInteractions(userId, profileId);
        
        return searchResults.map(item => ({
            ...item.toObject(), // Convert Mongoose document to plain object
            isLiked: interactions.profileLikes.includes(item.name),
            isWatched: interactions.profileWatched.includes(item.name)
        }));
    }

    // Convert all results to plain objects without interaction status
    return searchResults.map(item => ({
        ...item.toObject(),
        isLiked: false,
        isWatched: false
    }));
}

// Toggle like using new profile interaction system
async function toggleContentLike(contentName, userId, profileId) {
    // Validate inputs
    if (!contentName || contentName.trim() === '') {
        throw new Error('Content name is required');
    }

    if (!userId || isNaN(userId) || userId <= 0) {
        throw new Error('Valid user ID is required');
    }

    if (!profileId || isNaN(profileId) || profileId <= 0) {
        throw new Error('Valid profile ID is required');
    }

    // Use new profile interaction service
    const result = await profileInteractionService.toggleContentLike(
        parseInt(userId),
        parseInt(profileId),
        contentName.trim()
    );

    return {
        contentName: contentName.trim(),
        isLiked: result.isLiked,
        message: result.message
    };
}

// Get content for feed page (with profile-specific data)
async function getContentForFeed(userId, profileId) {
    try {
        // Validate inputs
        if (!userId || isNaN(userId) || userId <= 0) {
            throw new Error('Valid user ID is required for feed');
        }

        if (!profileId || isNaN(profileId) || profileId <= 0) {
            throw new Error('Valid profile ID is required for feed');
        }

        // Get all content with profile-specific like/watched status
        const content = await getAllContent(parseInt(userId), parseInt(profileId));

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

        return {
            content: content,
            genreGroups: genreGroups,
            totalCount: content.length,
            likedCount: content.filter(item => item.isLiked).length,
            watchedCount: content.filter(item => item.isWatched).length,
            userId: parseInt(userId),
            profileId: parseInt(profileId)
        };
    } catch (error) {
        // If no content found, return empty data structure instead of throwing
        if (error.message === 'No content found') {
            return {
                content: [],
                genreGroups: {},
                totalCount: 0,
                likedCount: 0,
                watchedCount: 0,
                userId: parseInt(userId),
                profileId: parseInt(profileId)
            };
        }
        throw error;
    }
}

// Mark content as watched using new profile interaction system
async function markAsWatched(contentName, userId, profileId) {
    try {
        // Validate inputs
        if (!contentName || contentName.trim() === '') {
            throw new Error('Content name is required');
        }

        if (!userId || isNaN(userId) || userId <= 0) {
            throw new Error('Valid user ID is required');
        }

        if (!profileId || isNaN(profileId) || profileId <= 0) {
            throw new Error('Valid profile ID is required');
        }

        const result = await profileInteractionService.markContentAsWatched(
            parseInt(userId),
            parseInt(profileId),
            contentName.trim()
        );
        
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getAllContent,
    getContentByName,
    getContentByGenre,
    toggleContentLike,
    getContentForFeed,
    searchContent,
    markAsWatched
};