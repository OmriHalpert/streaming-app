const userModel = require('../models/usersModel');

// Business logic for user operations (remove class later and use static methods)
class UserService {
    
    // Get all users with safe data validation
    static async getAllUsers() {
        // Fetch users list
        const users = await userModel.readUsersFromFile();

        // No users exist
        if (users.length === 0) {
            throw new Error('No users found');
        }

        // Remove sensitive data from all users
        return users.map(user => ({
            id: user.id,
            email: user.email,
            username: user.username,
            profiles: user.profiles || []
        }));
    }
    
    // Get user by ID with validation
    static async getUserById(userId) {
        // Validate user ID
        if (isNaN(userId) || userId <= 0) {
            throw new Error('Invalid user ID');
        }

        // Fetch users from database
        const users = await userModel.readUsersFromFile();
        const foundUser = users.find(user => user.id === parseInt(userId));

        if (!foundUser) {
            throw new Error('User not found');
        }

        // Return safe user data (no password)
        return {
            id: foundUser.id,
            email: foundUser.email,
            username: foundUser.username,
            profiles: foundUser.profiles || []
        };
    }

    // Get user profiles by ID
    static async getUserProfiles(userId) {
        // Validate user ID
        if (isNaN(userId) || userId <= 0) {
            throw new Error('Invalid user ID');
        }

        // Fetch users from database
        const users = await userModel.readUsersFromFile();
        const foundUser = users.find(user => user.id === parseInt(userId));

        if (!foundUser) {
            throw new Error('User not found');
        }

        return foundUser.profiles || [];
    }

    // Get user data and profiles together (for profiles page)
    static async getUserWithProfiles(userId) {
        const user = await this.getUserById(userId);
        const profiles = await this.getUserProfiles(userId);

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username
            },
            profiles: profiles
        };
    }

    // Register a new user with validation
    static async register(email, username, password) {
        // Input validation
        if (!email || !username || !password) {
            throw new Error('All fields are required');
        }

        // Trim inputs
        const trimmedEmail = email.trim();
        const trimmedUsername = username.trim();
        const trimmedPassword = password.trim();

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            throw new Error('Invalid email format');
        }

        // Length validations
        if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
            throw new Error(trimmedEmail.length < 5 ? 'Email must be at least 5 characters' : 'Email must be no more than 254 characters');
        }

        if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
            throw new Error(trimmedUsername.length < 3 ? 'Username must be at least 3 characters' : 'Username must be no more than 30 characters');
        }

        if (trimmedPassword.length < 6 || trimmedPassword.length > 128) {
            throw new Error(trimmedPassword.length < 6 ? 'Password must be at least 6 characters' : 'Password must be no more than 128 characters');
        }

        // Use model for actual registration
        return await userModel.register(trimmedEmail, trimmedUsername, trimmedPassword);
    }

    // Login user with validation
    static async login(email, password) {
        // Input validation
        if (!email || !password) {
            throw new Error('All fields are required');
        }

        // Trim inputs
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            throw new Error('Invalid email format');
        }

        // Length validations
        if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
            throw new Error(trimmedEmail.length < 5 ? 'Email must be at least 5 characters' : 'Email must be no more than 254 characters');
        }

        if (trimmedPassword.length < 6 || trimmedPassword.length > 128) {
            throw new Error(trimmedPassword.length < 6 ? 'Password must be at least 6 characters' : 'Password must be no more than 128 characters');
        }

        // Use model for actual login
        return await userModel.login(trimmedEmail, trimmedPassword);
    }
}

module.exports = UserService;