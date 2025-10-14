// Imports
const { getUserById: getUserByIdService, getUserProfiles: getUserProfilesService } = require('../services/userService');


// Helper functions
// Handle user-related errors
function handleUserError(error, res, context = 'user operation') {
    console.error(`Error in ${context}:`, error);
    
    // Handle specific validation errors from service layer
    if (error.message === 'Invalid user ID' || 
        error.message === 'User not found') {
        return res.status(400).json({'error': error.message});
    }
    
    if (error.message === 'No users found') {
        return res.status(404).json({'error': error.message});
    }
    
    // Handle generic server errors
    return res.status(500).json({'error': 'Internal server error'});
}

// Main functions
// Returns user by ID
async function getUserById(req, res) {
    try {
        // Convert to integer
        const userId = Number(req.params.id);

        // Fetch user via user services
        const user = await getUserByIdService(userId);

        return res.status(200).json({'user': user});

    } catch (error) {
        return handleUserError(error, res, 'fetching user by ID');
    }
}

// Returns the user's profiles list
async function getUserProfiles(req, res) {
    try {
        // Convert to integer
        const userId = Number(req.params.id);

        // Fetch user profiles using user services
        const profiles = await getUserProfilesService(userId);

        return res.status(200).json({'profiles': profiles});

    } catch (error) {
        return handleUserError(error, res, 'fetching user profiles');
    }
}

module.exports = {
    getUserById,
    getUserProfiles
}