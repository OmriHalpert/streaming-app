const { register: registerUser, login: loginUser } = require('../services/userService');

// Register controller
async function register(req, res) {
    try {
        const { email, username, password } = req.body;

        // Delegate to service layer
        const user = await registerUser(email, username, password);

        // Return success response
        return res.status(201).json({ 
            message: 'User created successfully', 
            user: user
        });

    } catch (error) {
        return handleAuthError(error, res, 'registration');
    }
}

// Login controller
async function login(req, res) {
    try {
        const { email, password } = req.body;
        
        // Delegate to service layer
        const user = await loginUser(email, password);

        // Create session and store user data in it
        req.session.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            profiles: user.profiles
        };

        return res.status(200).json({ 
            message: 'Login successful',
            user: user
        });
    } catch (error) {
        return handleAuthError(error, res, 'login');
    }
}

// Logout controller - destroy session and redirect to login
async function logout(req, res) {
    try {
        // Destroy the session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            // Clear the session cookie
            res.clearCookie('connect.sid');
            // Redirect to login page
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Logout error:', error);
        // Even if there's an error, redirect to login
        res.redirect('/login');
    }
}

// Private helper function to handle auth-related errors
function handleAuthError(error, res, context = 'authentication') {
    console.error(`${context} error:`, error);
    
    // Define validation error messages
    const validationErrors = [
        'All fields are required',
        'Invalid email format',
        'Email must be at least 5 characters',
        'Email must be no more than 254 characters',
        'Username must be at least 3 characters',
        'Username must be no more than 30 characters',
        'Password must be at least 6 characters',
        'Password must be no more than 128 characters',
        'Email already exists',
        'Email does not exist',
        'Incorrect Password'
    ];
    
    // Handle specific error types
    if (validationErrors.includes(error.message)) {
        return res.status(400).json({ error: error.message });
    }

    // Handle server errors
    const serverMessage = context === 'registration' 
        ? 'Server error - failed to create user'
        : 'Server error - failed to login';
    return res.status(500).json({ error: serverMessage });
}

module.exports = {
    register,
    login,
    logout
};