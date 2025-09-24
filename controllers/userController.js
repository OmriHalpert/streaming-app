const userModel = require('../models/usersModel');

// Returns all users list
async function getUsers(req, res) {
    try {
        const users = await userModel.readUsersFromFile();

        // If users array is empty
        if (users.length === 0) {
            return res.status(404).json({'error': 'No users found'});
        }
        return res.status(200).json({'users': users});
    } catch (error) {
        return res.status(500).json({'error': 'Internal server error'});
    }
}

// Returns user by ID
async function getUserById(req, res) {
    try {
        const userId = Number(req.params.id);
        
        // Validate that the ID is a valid number
        if (isNaN(userId) || userId <= 1) {
            return res.status(400).json({'error': 'Invalid user ID'});
        }

        const users = await userModel.readUsersFromFile();
        const foundUser = users.find(user => user.id === userId);

        if (!foundUser) {
            return res.status(404).json({'error': 'User not found'});
        }

        return res.status(200).json({'user': foundUser});
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return res.status(500).json({'error': 'Internal server error'});
    }
}

module.exports = {
    getUsers,
    getUserById
}