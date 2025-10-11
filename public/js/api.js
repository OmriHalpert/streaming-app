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

// Make functions available globally
window.UserAPI = {
    fetchUserProfiles,
    fetchUser
};