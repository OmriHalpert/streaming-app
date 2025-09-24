const userModel = require('../models/usersModel');

// Register controller
async function register(req, res) {
    try {
        const { email, username, password } = req.body;

        // Validate and trim inputs
        const { email: trimmedEmail, username: trimmedUsername, password: trimmedPassword } = 
            validateAndTrimInputs({ email, username, password });

        // Email format and length validation
        validateEmailFormat(trimmedEmail);
        validateFieldLength('email', trimmedEmail, 5, 254, 'Email');

        // Username length validation
        validateFieldLength('username', trimmedUsername, 3, 30, 'Username');

        // Password length validation
        validateFieldLength('password', trimmedPassword, 6, 128, 'Password');

        // Call the register function from userModel with trimmed values
        const user = await userModel.register(trimmedEmail, trimmedUsername, trimmedPassword);

        // Return success response
        return res.status(201).json({ 
            message: 'User created successfully', 
            user: user
        });

    } catch (error) {
        return handleAuthError(error, res, 'registration');
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;
        
        // Validate and trim inputs
        const { email: trimmedEmail, password: trimmedPassword } = 
            validateAndTrimInputs({ email, password });

        // Email format and length validation
        validateEmailFormat(trimmedEmail);
        validateFieldLength('email', trimmedEmail, 5, 254, 'Email');

        // Password length validation
        validateFieldLength('password', trimmedPassword, 6, 128, 'Password');

        const loginSuccess = await userModel.login(trimmedEmail, trimmedPassword);

        if (loginSuccess) {
            return res.status(200).json({ message: 'Login successful' });
        }
    } catch (error) {
        return handleAuthError(error, res, 'login');
    }
}

// Private helper functions
function validateAndTrimInputs(inputs) {
    const trimmed = {};
    
    // Trim all inputs
    for (const [key, value] of Object.entries(inputs)) {
        if (!value) {
            throw new Error('All fields are required');
        }
        trimmed[key] = value.trim();
    }
    
    return trimmed;
}

function validateEmailFormat(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
    }
}

function validateFieldLength(field, value, min, max, fieldName) {
    if (value.length < min) {
        throw new Error(`${fieldName} must be at least ${min} characters`);
    }
    if (value.length > max) {
        throw new Error(`${fieldName} must be no more than ${max} characters`);
    }
}

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
        'Password must be at least 6 characters',  // Fixed: removed "long"
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
    login
};