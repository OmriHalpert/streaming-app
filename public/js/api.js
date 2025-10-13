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

// Make functions available globally
window.UserAPI = {
    fetchUserProfiles,
    fetchUser,
    fetchContent,
    markContentAsWatched
};