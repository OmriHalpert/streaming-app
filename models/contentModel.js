const fs = require('fs').promises;
const path = require('path');

// Path to the content JSON file
const contentFilePath = path.join(__dirname, '../data/content.json');

// Retrieves all content from JSON
async function getContent() {
    try {
        const contentData = await fs.readFile(contentFilePath, 'utf8');
        return JSON.parse(contentData);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Writes content data to JSON file
async function writeContentToFile(contentData) {
    try {
        await fs.writeFile(contentFilePath, JSON.stringify(contentData, null, 2), 'utf8');
    } catch (error) {
        throw error;
    }
}

// Manages like functionality
async function updateContentLikes(contentName, profileId, action) {
    const contentArray = await getContent();
    
    // Find content by name
    const contentIndex = contentArray.findIndex(item => item.name === contentName);
    
    if (contentIndex === -1) {
        throw new Error('Content not found');
    }

    // Checks if the content is liked by the profile
    const content = contentArray[contentIndex];    
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

    // Update the content in the array
    contentArray[contentIndex] = content;
    
    // Write back to file
    await writeContentToFile(contentArray);
    
    return {
        content: content,
        likeCount: content.likes,
        isLiked: content.profileLikes.includes(profileId)
    };
}

// Search content by name
async function searchContent(query) {
    const contentArray = await getContent();
    
    if (!query || query.trim() === '') {
        return contentArray;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return contentArray.filter(content => {
        const nameMatch = content.name.toLowerCase().includes(searchTerm);
        return nameMatch;
    });
}

module.exports = {
    getContent,
    writeContentToFile,
    updateContentLikes,
    searchContent
};