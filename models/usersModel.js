const fs = require('fs').promises;
const path = require('path');

// Path to the users JSON file
const usersFilePath = path.join(__dirname, '../data/users.json');

// registers a new user
async function register(email, username, password) {
    try {
        console.log('in register');

        // Validate required fields
        // will be handeled in frontend level
        // if (!email || !username || !password) {
        //     throw new Error('All fields are required');
        // }

        // Read existing users
        const usersData = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(usersData);

        // Check if email already exists
        const emailExists = users.some(user => user.email === email);
        if (emailExists) {
            throw new Error('Email already exists');
        }

        // Create new user object
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            email,
            username,
            password
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

module.exports = {
    register
};