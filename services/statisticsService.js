// Imports
const { getContentById } = require('./contentService');
const { getProfileInteractions } = require('./profileInteractionService');
const { getUserProfiles } = require('./userService');

// Helper functions
// Check if a timestamp is from today
function isToday(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}

// Main functions
async function getDailyViewsPerProfile(userId) {
    try {
        // Fetch user profiles
        const userProfiles = await getUserProfiles(userId);
        
        // Prepare profile labels and data
        const labels = [];
        const data = [];
        
        for (const profile of userProfiles) {
            // Fetch interactions per profile
            const interactions = await getProfileInteractions(userId, profile.id);
            
            // Count today's views
            let todayViews = 0;
            
            interactions.progress.forEach((progressItem) => {
                const timestamp = progressItem.updatedAt;
                
                if (isToday(timestamp)) {
                    todayViews++;
                }
            });
            
            // Add profile data
            labels.push(profile.name);
            data.push(todayViews);
        }
        
        return {
            labels: labels,
            data: data
        };
    } catch (error) {
        console.error('Error in getDailyViewsPerProfile:', error);
        throw error;
    }
}

async function getGenrePopularity(userId) {
    try {
        // Fetch user profiles
        const userProfiles = await getUserProfiles(userId);

        // Object to count genre occurrences
        const genreCounts = {};

        for (const profile of userProfiles) {
            // Fetch interactions per profile
            const interactions = await getProfileInteractions(userId, profile.id);

            // Loop through progress items
            for (const progressItem of interactions.progress) {
                const contentId = progressItem.contentId;

                // Fetch content from services
                const content = await getContentById(contentId);

                // Extract genres array
                const genres = content.genre;

                // Add / accumulate content in object
                genres.forEach(genre => {
                    if (genreCounts[genre]) {
                        genreCounts[genre]++;
                    } else {
                        genreCounts[genre] = 1;
                    }
                });
            }
        }

        // Convert object to arrays for chart
        const labels = Object.keys(genreCounts);
        const data = Object.values(genreCounts);
        
        return {
            labels: labels,
            data: data
        };

    } catch (error) {
        console.error('Error in getGenrePopularity:', error);
        throw error;
    }
}

module.exports = {
    getDailyViewsPerProfile,
    getGenrePopularity
}