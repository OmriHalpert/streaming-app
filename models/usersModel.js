const fs = require('fs').promises;
const { throws } = require('assert');
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

        // Create new user object
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

module.exports = {
    register,
    login,
    readUsersFromFile
};