const { getContentForFeed, toggleContentLike: toggleLike, searchContent: searchContentService, markAsWatched } = require('../services/contentService');
const { getUserProfiles: getUserProfilesService } = require('../services/userService');
const { getRecommendations: getRecommendationsService } = require('../services/recommendationService');

// Renders feed page with content
async function renderFeedPage(req, res) {
    try {
        // Get profileId and userId from query parameters
        const profileId = req.query.profileId;
        const userId = req.query.userId;
        
        if (!profileId || !userId) {
            return res.status(400).render('error', { 
                message: 'Profile ID and user ID are required to access feed' 
            });
        }

        // Renders page
        res.render('feed', { 
            profileId, 
            userId 
        });
        
    } catch (error) {
        console.error('Error rendering feed page:', error);
        res.status(500).render('error', { 
            message: 'Unable to load feed. Please try again.' 
        });
    }
}

// Get content data for API
async function getContent(req, res) {
    try {
        const { userId, profileId } = req.query;
        
        // Validate required parameters
        if (!userId || !profileId) {
            return res.status(400).json({
                success: false,
                error: 'User ID and Profile ID are required'
            });
        }
        
        // Get content for feed with profile-specific data
        const feedData = await getContentForFeed(userId, profileId);
        
        res.json({
            success: true,
            data: feedData
        });
        
    } catch (error) {
        console.error('Error fetching content:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to fetch content. Please try again.'
        });
    }
}

// Toggle content like
async function toggleContentLike(req, res) {
    try {
        const { contentName, userId, profileId } = req.body;
        
        if (!contentName || !userId || !profileId) {
            return res.status(400).json({
                success: false,
                error: 'Content name, user ID, and profile ID are required'
            });
        }

        const result = await toggleLike(contentName, userId, profileId);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error toggling like:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to toggle like. Please try again.'
        });
    }
}

// Search content
async function searchContent(req, res) {
    try {
        const { q: query, userId, profileId } = req.query;
        
        // Convert to integers if provided
        const userIdInt = userId ? parseInt(userId) : null;
        const profileIdInt = profileId ? parseInt(profileId) : null;
        
        const results = await searchContentService(query, userIdInt, profileIdInt);
        
        res.json({
            success: true,
            data: results
        });
        
    } catch (error) {
        console.error('Error searching content:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to search content. Please try again.'
        });
    }
}

// Mark content as watched
async function markContentAsWatched(req, res) {
    try {
        const { contentName } = req.params;
        const { userId, profileId } = req.body;
        
        if (!contentName || !userId || !profileId) {
            return res.status(400).json({
                success: false,
                error: 'Content name, user ID, and profile ID are required'
            });
        }

        const result = await markAsWatched(contentName, parseInt(userId), parseInt(profileId));
        
        res.json({
            success: true,
            message: result.message,
            alreadyWatched: result.alreadyWatched
        });
        
    } catch (error) {
        console.error('Error marking content as watched:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to mark content as watched. Please try again.'
        });
    }
}

// Get recommendations
async function getRecommendations(req, res) {
    try {
        const { userId, profileId } = req.params;
        const limit = parseInt(req.query.limit) || 10;
        
        if (!userId || !profileId) {
            return res.status(400).json({
                success: false,
                error: 'User ID and Profile ID are required'
            });
        }
        
        const recommendations = await getRecommendationsService(parseInt(userId), parseInt(profileId), limit);
        
        res.json({
            success: true,
            data: recommendations
        });
        
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to fetch recommendations right now.'
        });
    }
}

module.exports = {
    renderFeedPage,
    getContent,
    toggleContentLike,
    searchContent,
    markContentAsWatched,
    getRecommendations
};