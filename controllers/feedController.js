const { getContentForFeed, toggleContentLike: toggleLike, searchContent: searchContentService } = require('../services/contentService');
const { getUserProfiles: getUserProfilesService } = require('../services/userService');

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
        const profileId = req.query.profileId;
        
        if (!profileId) {
            return res.status(400).json({
                error: 'Profile ID is required'
            });
        }

        // Get content data for feed
        const feedData = await getContentForFeed(profileId);
        
        res.json(feedData);
        
    } catch (error) {
        console.error('Error fetching content via API:', error);
        
        if (error.message === 'Valid profile ID is required for feed') {
            return res.status(400).json({
                error: 'Invalid profile ID'
            });
        }
        
        res.status(500).json({
            error: 'Unable to fetch content. Please try again.'
        });
    }
}

// Toggle like for content
async function toggleContentLike(req, res) {
    try {
        const { contentName, profileId } = req.body;
        
        if (!contentName || !profileId) {
            return res.status(400).json({
                error: 'Content name and profile ID are required'
            });
        }
        
        const result = await toggleLike(contentName, profileId);
        
        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error toggling like:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to update like. Please try again.'
        });
    }
}

// Search content
async function searchContent(req, res) {
    try {
        const { q: query, profileId } = req.query;
        
        // Convert profileId to integer if provided
        const profileIdInt = profileId ? parseInt(profileId) : null;
        
        const results = await searchContentService(query, profileIdInt);
        
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

module.exports = {
    renderFeedPage,
    getContent,
    toggleContentLike,
    searchContent
};