// API service functions for user-related operations

// Fetch user profiles from the API
async function fetchUserProfiles(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/profiles`);
        const result = await response.json();
        
        if (response.ok) {
            return result.profiles;
        } else {
            console.error('Failed to fetch profiles:', result.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return [];
    }
}

// Fetch user details from the API
async function fetchUser(userId) {
    try {
        const response = await fetch(`/api/users/${userId}`);
        const result = await response.json();
        
        if (response.ok) {
            return result.user;
        } else {
            console.error('Failed to fetch user:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
}

// Fetch content from the API
async function fetchContent(userId, profileId) {
    try {
        const response = await fetch(`/api/content?userId=${userId}&profileId=${profileId}`);
        const result = await response.json();
        
        if (response.ok) {
            return result.data;
        } else {
            console.error('Failed to fetch content:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error fetching content:', error);
        return null;
    }
}

// Mark content as watched
async function markContentAsWatched(userId, profileId, contentName) {
    try {
        const response = await fetch(`/api/content/${encodeURIComponent(contentName)}/watch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: parseInt(userId),
                profileId: parseInt(profileId)
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            return result;
        } else {
            console.error('Failed to mark as watched:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error marking content as watched:', error);
        return null;
    }
}

// Get recommendations
async function fetchRecommendations(userId, profileId, limit = 10) {
    try {
        const response = await fetch(`/api/content/recommendations/${userId}/${profileId}?limit=${limit}`);
        const result = await response.json();
        
        if (response.ok) {
            return result.data;
        } else {
            console.error('Failed to fetch recommendations:', result.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        return [];
    }
}

// Toggle content like
async function toggleContentLike(userId, profileId, contentName) {
    try {
        const response = await fetch('/api/content/like', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contentName: contentName,
                userId: parseInt(userId),
                profileId: parseInt(profileId)
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            return result;
        } else {
            console.error('Failed to toggle like:', result.error);
            return null;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
        return null;
    }
}

async function fetchContentByGenre(genreName, userId = null, profileId = null) {
    try {
        let url = `/api/content/${encodeURIComponent(genreName)}`;
        
        // Add query parameters if userId and profileId are provided
        if (userId && profileId) {
            url += `?userId=${userId}&profileId=${profileId}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();

        if (response.ok && result.success) {
            return result.data;
        } else {
            console.error('Failed to fetch content by genre', result.error);
            return [];
        }
    } catch (error) {
        console.error('Error fetching content by genre:', error);
        return [];
    }
}

// Make functions available globally
window.UserAPI = {
    fetchUserProfiles,
    fetchUser,
    fetchContent,
    markContentAsWatched,
    fetchRecommendations,
    toggleContentLike,
    fetchContentByGenre
};