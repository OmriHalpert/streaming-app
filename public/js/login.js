// DOM element references - shared across functions
const form = document.querySelector('#login-form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const emailError = document.querySelector('#email-error');
const passwordError = document.querySelector('#password-error');
const submitButton = document.querySelector('.login-button');

function loginValidation() {

    // Clears fields
    const clearErrors = () => {
        emailError.textContent = '';
        passwordError.textContent = '';
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault(); // Always prevent default form submission
        clearErrors();
        let hasError = false;

        // Basic frontend validation for immediate user feedback
        if (!email.value) {
            hasError = true;
            emailError.textContent = 'Email is required';
        }

        if (!password.value) {
            hasError = true;
            passwordError.textContent = 'Password is required';
        }

        // If no validation errors, proceed with login
        if (!hasError) {
            loginUser(email.value, password.value);
        }
    })
}

// handles API login
async function loginUser(email, password) {
    // Store original button text outside try block
    const originalText = submitButton.textContent;
    
    try {
        // Show loading state
        submitButton.textContent = 'Logging in...';
        submitButton.disabled = true;

        // Send login request to server
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const result = await response.json();

        if (response.ok) {
            // Success - store complete user session and redirect
            const userSession = {
                isLoggedIn: true,
                id: result.user.id,
                email: result.user.email,
                username: result.user.username,
                profiles: result.user.profiles
            };

            localStorage.setItem('userSession', JSON.stringify(userSession));
            window.location.href = `/profiles?userId=${result.user.id}`;
        } else {
            // Handle server validation errors
            if (result.error === 'Email does not exist') {
                emailError.textContent = 'No account found with this email';
            } else if (result.error.includes('email') || result.error === 'Invalid email format') {
                emailError.textContent = result.error;
            } else if (result.error.includes('Password') || result.error.includes('password') || 
                       result.error === 'Incorrect Password') {
                passwordError.textContent = result.error;
            } else {
                emailError.textContent = result.error || 'Login failed. Please try again.';
            }
        }

    } catch (error) {
        console.error('Login error:', error);
        emailError.textContent = 'General error. Please try again.';
    } finally {
        // Reset button state
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

// Initialize login when page loads
document.addEventListener('DOMContentLoaded', () => {
    loginValidation();
});