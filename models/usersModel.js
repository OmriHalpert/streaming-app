const fs = require('fs').promises;
const path = require('path');

// Path to the users JSON file
const usersFilePath = path.join(__dirname, '../data/users.json');

// registers a new user
async function register(email, username, password) {
    try {
        // Check if email already exists
        if (await emailExists(email)) {
            throw new Error('Email already exists');
        }

        // Read existing users for creating new user
        const users = await readUsersFromFile();

        // Create new user object (generate random pic from profile_pics folder)
        const profilePicsPath = path.join(__dirname, '../public/resources/profile_pics');
        const profilePics = await fs.readdir(profilePicsPath);
        const randomAvatar = profilePics[Math.floor(Math.random() * profilePics.length)];
        
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            email,
            username,
            password,
            profiles: [{"id":"1", "name":"profile 1", "avatar": `/resources/profile_pics/${randomAvatar}`}]
        };

        // Add new user to users array
        users.push(newUser);

        // Write updated users back to file
        await fs.writeFile(usersFilePath, JSON.stringify(users));

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

// validates user login
async function login(email, password) {
    try {
        // Find user by email
        const foundUser = await findUserByEmail(email);
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

async function readUsersFromFile() {
    try {
        const usersData = await fs.readFile(usersFilePath, 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Private helper functions
async function findUserByEmail(email) {
    const users = await readUsersFromFile();
    return users.find(user => user.email === email);
}

async function emailExists(email) {
    const user = await findUserByEmail(email);
    return !!user; // Convert to boolean
}

// Add a new profile to a user
async function addProfile(userId, profileName) {
    try {
        // Read all users
        const users = await readUsersFromFile();
        
        // Find the user
        const userIndex = users.findIndex(user => user.id === parseInt(userId));
        if (userIndex === -1) {
            throw new Error('User not found');
        }
        
        // Get current profiles for this user
        const currentProfiles = users[userIndex].profiles || [];
        
        // Check if user already has 5 profiles (Netflix limit)
        if (currentProfiles.length >= 5) {
            throw new Error('Maximum number of profiles (5) reached');
        }
        
        // Generate new profile ID (highest current + 1)
        const newProfileId = currentProfiles.length > 0 
            ? Math.max(...currentProfiles.map(p => parseInt(p.id))) + 1 
            : 1;
        
        // Generate random avatar from profile_pics folder
        const profilePicsPath = path.join(__dirname, '../public/resources/profile_pics');
        const profilePics = await fs.readdir(profilePicsPath);
        const randomAvatar = profilePics[Math.floor(Math.random() * profilePics.length)];
        
        // Create new profile object
        const newProfile = {
            id: newProfileId.toString(),
            name: profileName,
            avatar: `/resources/profile_pics/${randomAvatar}`
        };
        
        // Add new profile to user's profiles
        users[userIndex].profiles.push(newProfile);
        
        // Write updated users back to file
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
        
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
    addProfile
};