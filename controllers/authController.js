const userModel = require('../models/usersModel');

// Register controller
async function register(req, res) {
    try {
        const { email, username, password } = req.body;

        // Call the register function from userModel
        const user = await userModel.register(email, username, password);

        // Return success response
        return res.status(201).json({ 
            message: 'User created successfully', 
            user: user
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific error types
        if (error.message === 'All fields are required' || 
            error.message === 'Invalid email format' || 
            error.message === 'Password must be at least 6 characters long' ||
            error.message === 'Email already exists') {
            return res.status(400).json({ error: error.message });
        }

        // Handle server errors
        return res.status(500).json({ error: 'Server error - failed to create user' });
    }
}

module.exports = {
    register
};