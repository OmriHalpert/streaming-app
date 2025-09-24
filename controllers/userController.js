const UserService = require('../services/userService');

// Returns all users list
async function getUsers(req, res) {
    try {
        const users = await UserService.getAllUsers();
        return res.status(200).json({'users': users});
    } catch (error) {
        return handleUserError(error, res, 'fetching all users');
    }
}

// Returns user by ID
async function getUserById(req, res) {
    try {
        const userId = Number(req.params.id);
        const user = await UserService.getUserById(userId);

        return res.status(200).json({'user': user});
    } catch (error) {
        return handleUserError(error, res, 'fetching user by ID');
    }
}

async function getUserProfiles(req, res) {
    try {
        const userId = Number(req.params.id);
        const profiles = await UserService.getUserProfiles(userId);

        return res.status(200).json({'profiles': profiles});
    } catch (error) {
        return handleUserError(error, res, 'fetching user profiles');
    }
}

// Private helper function to handle user-related errors
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

module.exports = {
    getUsers,
    getUserById,
    getUserProfiles
}