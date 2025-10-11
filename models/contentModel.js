const Content = require('./Content'); // Import the Mongoose Content model

// Get all content from MongoDB
async function getContent() {
    try {
        return await Content.find({});
    } catch (error) {
        throw error;
    }
}

// Update content likes functionality
async function updateContentLikes(contentName, profileId, action) {
    try {
        // Find content by name
        const content = await Content.findOne({ name: contentName });
        
        if (!content) {
            throw new Error('Content not found');
        }

        // Check if the content is liked by the profile
        const wasLiked = content.profileLikes.includes(profileId);
        
        if (action === 'like') {
            if (!wasLiked) {
                content.profileLikes.push(profileId);
                content.likes = (content.likes || 0) + 1;
            }
        } else if (action === 'unlike') {
            if (wasLiked) {
                content.profileLikes = content.profileLikes.filter(id => id !== profileId);
                content.likes = Math.max((content.likes || 0) - 1, 0);
            }
        } else if (action === 'toggle') {
            if (wasLiked) {
                content.profileLikes = content.profileLikes.filter(id => id !== profileId);
                content.likes = Math.max((content.likes || 0) - 1, 0);
            } else {
                content.profileLikes.push(profileId);
                content.likes = (content.likes || 0) + 1;
            }
        } else {
            throw new Error('Invalid action. Use: like, unlike, or toggle');
        }

        // Save the updated content
        await content.save();
        
        return {
            content: content,
            likeCount: content.likes,
            isLiked: content.profileLikes.includes(profileId)
        };
    } catch (error) {
        throw error;
    }
}

// Search content by name
async function searchContent(query) {
    try {
        if (!query || query.trim() === '') {
            return await getContent();
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        // Use MongoDB text search with regex for flexible matching, sorted by popularity
        return await Content.find({
            name: { $regex: searchTerm, $options: 'i' }
        }).sort({ likes: -1 }); // Most liked first for search results
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getContent,
    updateContentLikes,
    searchContent
};