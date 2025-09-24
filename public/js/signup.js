// DOM element references - shared across functions
const form = document.querySelector('#signup-form');
const email = document.querySelector('#email');
const username = document.querySelector('#username');
const password = document.querySelector('#password');
const emailError = document.querySelector('#email-error');
const usernameError = document.querySelector('#username-error');
const passwordError = document.querySelector('#password-error');
const submitButton = document.querySelector('.signup-button');

// Signup functionality
function signupValidation() {

    // Clear error messages
    const clearErrors = () => {
        emailError.textContent = '';
        usernameError.textContent = '';
        passwordError.textContent = '';
    }

    // On Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Always prevent default form submission
        clearErrors();
        let hasError = false;

        // Basic frontend validation for immediate user feedback
        if (!email.value) {
            hasError = true;
            emailError.textContent = 'Email is required';
        }

        if (!username.value) {
            hasError = true;
            usernameError.textContent = 'Username is required';
        }

        if (!password.value) {
            hasError = true;
            passwordError.textContent = 'Password is required';
        }

        // If no validation errors, proceed with registration
        if (!hasError) {
            registerUser(email.value, username.value, password.value);
        }
    });
}

// handles API registration
async function registerUser(email, username, password) {
    // Store original button text outside try block
    const originalText = submitButton.textContent;
    
    try {
        // Show loading state
        submitButton.textContent = 'Creating Account...';
        submitButton.disabled = true;

        // Send registration request to server
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Success - redirect to login page with success message
            alert('Account created successfully! Please login with your credentials.');
            window.location.href = 'login.html';
        } else {
            // Handle server validation errors
            if (result.error.includes('email') || result.error === 'Email already exists' || 
                result.error === 'Invalid email format') {
                emailError.textContent = result.error;
            } else if (result.error.includes('Username') || result.error.includes('username')) {
                usernameError.textContent = result.error;
            } else if (result.error.includes('Password') || result.error.includes('password')) {
                passwordError.textContent = result.error;
            } else {
                // General error
                emailError.textContent = result.error || 'Registration failed. Please try again.';
            }
        }

    } catch (error) {
        console.error('Registration error:', error);
        emailError.textContent = 'General error. Please try again.';
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Initialize signup when page loads
document.addEventListener('DOMContentLoaded', function() {
    signupValidation();
});