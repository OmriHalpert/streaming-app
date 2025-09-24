const userModel = require('../models/usersModel');

// Returns all users list
async function getUsers(req, res) {
    try {
        const users = await userModel.readUsersFromFile();

        // If users array is empty
        if (users.length === 0) {
            return res.status(404).json({'error': 'No users found'});
        }
        
        // Remove sensitive data from response
        const safeUsers = users.map(user => ({
            id: user.id,
            email: user.email,
            username: user.username,
            profiles: user.profiles || []
        }));
        
        return res.status(200).json({'users': safeUsers});
    } catch (error) {
        return res.status(500).json({'error': 'Internal server error'});
    }
}

// Returns user by ID
async function getUserById(req, res) {
    try {
        const userId = Number(req.params.id);
        const foundUser = await validateAndFetchUser(userId);

        // Remove sensitive data from response
        const safeUser = {
            id: foundUser.id,
            email: foundUser.email,
            username: foundUser.username,
            profiles: foundUser.profiles || []
        };

        return res.status(200).json({'user': safeUser});
    } catch (error) {
        return handleUserError(error, res, 'fetching user by ID');
    }
}

async function getUserProfiles(req, res) {
    try {
        const userId = Number(req.params.id);
        const foundUser = await validateAndFetchUser(userId);

        // Return user profiles list
        return res.status(200).json({'profiles': foundUser.profiles || []});
    } catch (error) {
        return handleUserError(error, res, 'fetching user profiles');
    }
}

// Private helper function to validate user ID and fetch user
async function validateAndFetchUser(userId) {
    // Validate that the ID is a valid number
    if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
    }

    // Fetch user from database
    const users = await userModel.readUsersFromFile();
    const foundUser = users.find(user => user.id === userId);

    if (!foundUser) {
        throw new Error('User not found');
    }

    return foundUser;
}

// Private helper function to handle user-related errors
function handleUserError(error, res, context = 'user operation') {
    console.error(`Error in ${context}:`, error);
    
    // Handle specific validation errors
    if (error.message === 'Invalid user ID' || 
        error.message === 'User not found') {
        return res.status(400).json({'error': error.message});
    }
    
    // Handle generic server errors
    return res.status(500).json({'error': 'Internal server error'});
}

module.exports = {
    getUsers,
    getUserById,
    getUserProfiles
}