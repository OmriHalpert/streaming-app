const userModel = require('../models/usersModel');

// Get all users with safe data validation
async function getAllUsers() {
    // Fetch users list through model layer
    const users = await userModel.readUsersFromFile();

    // No users exist
    if (users.length === 0) {
        throw new Error('No users found');
    }

    // Return safe user data (already excludes password from model)
    return users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        profiles: user.profiles || []
    }));
}

// Get user by ID with validation
async function getUserById(userId) {
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
    }

    // Use model to find user
    const foundUser = await userModel.findUserById(userId);

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
async function getUserProfiles(userId) {
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
    }

    // Use model to find user
    const foundUser = await userModel.findUserById(userId);

    if (!foundUser) {
        throw new Error('User not found');
    }

    return foundUser.profiles || [];
}

// Get user data and profiles together (for profiles page)
async function getUserWithProfiles(userId) {
    const user = await getUserById(userId);
    const profiles = await getUserProfiles(userId);

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
async function register(email, username, password) {
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
async function login(email, password) {
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

// Add a new profile to a user
async function addProfile(userId, profileName) {
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
    }

    // Validate profile name
    if (!profileName || typeof profileName !== 'string') {
        throw new Error('Profile name is required');
    }

    const trimmedProfileName = profileName.trim();
    
    // Profile name validations
    if (trimmedProfileName.length < 1 || trimmedProfileName.length > 12) {
        throw new Error(trimmedProfileName.length < 1 ? 'Profile name cannot be empty' : 'Profile name must be no more than 12 characters');
    }

    // Use model to add the profile
    return await userModel.addProfile(userId, trimmedProfileName);
}

// Updates a profile's name
async function updateUserProfile(userId, profileId, profileName) {
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
    }

    // Validate profile ID
    if (isNaN(profileId) || profileId <= 0) {
        throw new Error('Invalid profile ID');
    } 

    // Validate profile name
    if (!profileName || typeof profileName !== 'string') {
        throw new Error('Profile name is required');
    }

    const trimmedProfileName = profileName.trim();

    // Profile name validations
    if (trimmedProfileName.length < 1 || trimmedProfileName.length > 12) {
        throw new Error(trimmedProfileName.length < 1 ? 'Profile name cannot be empty' : 'Profile name must be no more than 12 characters');
    }

    return await userModel.updateUserProfile(userId, profileId, trimmedProfileName);
}

async function deleteUserProfile(userId, profileId) {
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
        throw new Error('Invalid user ID');
    }

    // Validate profile ID
    if (isNaN(profileId) || profileId <= 0) {
        throw new Error('Invalid profile ID');
    } 

    return await userModel.deleteUserProfile(userId, profileId);
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserProfiles,
    getUserWithProfiles,
    register,
    login,
    addProfile,
    updateUserProfile,
    deleteUserProfile,
};