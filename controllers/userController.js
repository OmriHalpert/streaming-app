// Imports
const { getUserById: getUserByIdService, getUserProfiles: getUserProfilesService, updateUser: updateUserService, deleteUser: deleteUserService } = require('../services/userService');


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

        // Validate userId
        if (!userId || isNaN(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Valid user ID is required' });
        }

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

        // Validate userId
        if (!userId || isNaN(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Valid user ID is required' });
        }

        // Fetch user profiles using user services
        const profiles = await getUserProfilesService(userId);

        return res.status(200).json({'profiles': profiles});

    } catch (error) {
        return handleUserError(error, res, 'fetching user profiles');
    }
}

// Update user information
async function updateUser(req, res) {
    try {
        // Convert to integer
        const userId = Number(req.params.id);

        // Validate userId
        if (!userId || isNaN(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Valid user ID is required' });
        }

        const updateData = req.body;

        // Update user via user services
        const updatedUser = await updateUserService(userId, updateData);

        return res.status(200).json({
            'success': true,
            'message': 'User updated successfully',
            'user': updatedUser
        });

    } catch (error) {
        if (error.message === 'Invalid user ID' || 
            error.message === 'User not found' ||
            error.message === 'Email already in use' ||
            error.message === 'Username already in use' ||
            error.message.includes('must be')) {
            return res.status(400).json({'error': error.message});
        }
        
        return handleUserError(error, res, 'updating user');
    }
}

// Delete user account
async function deleteUser(req, res) {
    try {
        // Convert to integer
        const userId = Number(req.params.id);

        // Validate userId
        if (!userId || isNaN(userId) || userId <= 0) {
            return res.status(400).json({ error: 'Valid user ID is required' });
        }

        // Delete user via user services
        const deletedUser = await deleteUserService(userId);

        return res.status(200).json({
            'success': true,
            'message': 'User deleted successfully',
            'user': deletedUser
        });

    } catch (error) {
        return handleUserError(error, res, 'deleting user');
    }
}

module.exports = {
    getUserById,
    getUserProfiles,
    updateUser,
    deleteUser
}