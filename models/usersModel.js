const fs = require('fs').promises;
const path = require('path');
const User = require('./User'); // Import the Mongoose User model

// Get next available user ID
async function getNextUserId() {
    const lastUser = await User.findOne().sort({ id: -1 });
    return lastUser ? lastUser.id + 1 : 1;
}

// Find user by email
async function findUserByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() });
}

// Find user by ID
async function findUserById(userId) {
    return await User.findOne({ id: parseInt(userId) });
}

// Check if email exists
async function emailExists(email) {
    const user = await findUserByEmail(email);
    return !!user;
}

// Get all users (excluding passwords)
async function readUsersFromFile() {
    return await User.find({}, { password: 0 });
}

// Helper function to generate random avatar
async function generateRandomAvatar() {
    const profilePicsPath = path.join(__dirname, '../public/resources/profile_pics');
    const profilePics = await fs.readdir(profilePicsPath);
    const randomAvatar = profilePics[Math.floor(Math.random() * profilePics.length)];
    return `/resources/profile_pics/${randomAvatar}`;
}

// Helper function to generate new profile ID for a user
function generateNewProfileId(existingProfiles) {
    return existingProfiles.length > 0 
        ? Math.max(...existingProfiles.map(p => parseInt(p.id))) + 1 
        : 1;
}

// Register a new user
async function register(email, username, password) {
    try {
        // Check if email already exists
        if (await emailExists(email)) {
            throw new Error('Email already exists');
        }

        // Generate new user ID
        const newUserId = await getNextUserId();

        // Generate random avatar
        const randomAvatar = await generateRandomAvatar();
        
        const newUser = new User({
            id: newUserId,
            email,
            username,
            password,
            profiles: [{
                id: "1", 
                name: "profile 1", 
                avatar: randomAvatar
            }]
        });

        // Save user to MongoDB
        await newUser.save();

        // Return user data (without password)
        return {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            createdAt: newUser.createdAt
        };

    } catch (error) {
        throw error;
    }
}

// Validate user login
async function login(email, password) {
    try {
        // Find user by email
        console.log("user details: ", email, password);
        const foundUser = await findUserByEmail(email);
        console.log('post validation: ', foundUser);
        if (!foundUser) {
            throw new Error('Email does not exist');
        }
    
        // Validates password
        if (foundUser.password !== password) {
            throw new Error('Incorrect Password');
        }

        // Return user data (without password)
        return {
            id: foundUser.id,
            email: foundUser.email,
            username: foundUser.username,
            profiles: foundUser.profiles
        };

    } catch (error) {
        throw error;
    }
}

// Add a new profile to a user
async function addProfile(userId, profileName) {
    try {
        // Find the user by ID
        const user = await findUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        
        // Check profile limit
        if (user.profiles.length >= 5) {
            throw new Error('Maximum number of profiles (5) reached');
        }
        
        // Generate new profile ID
        const newProfileId = generateNewProfileId(user.profiles);
        
        // Generate random avatar
        const randomAvatar = await generateRandomAvatar();
        
        const newProfile = {
            id: newProfileId.toString(),
            name: profileName,
            avatar: randomAvatar
        };
        
        // Add profile to user
        user.profiles.push(newProfile);
        
        // Save the updated user
        await user.save();
        
        // Return the new profile
        return newProfile;
        
    } catch (error) {
        throw error;
    }
}

module.exports = {
    register,
    login,
    readUsersFromFile,
    addProfile,
    findUserByEmail,
    findUserById,
    emailExists
};