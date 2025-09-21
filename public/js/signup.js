// Signup functionality
function signupValidation() {
    const form = document.querySelector('#signup-form');
    const email = document.querySelector('#email');
    const username = document.querySelector('#username');
    const password = document.querySelector('#password');
    const emailError = document.querySelector('#email-error');
    const usernameError = document.querySelector('#username-error');
    const passwordError = document.querySelector('#password-error');

    // Clear error messages
    const clearErrors = () => {
        emailError.textContent = '';
        usernameError.textContent = '';
        passwordError.textContent = '';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Always prevent default form submission
        clearErrors();
        let hasError = false;

        // Email validation
        if (email.validity.valueMissing) {
            hasError = true;
            emailError.textContent = 'Email is required';
        } else if (email.validity.typeMismatch) {
            hasError = true;
            emailError.textContent = 'Please enter a valid email address';
        }

        // Username validation
        const usernameValue = username.value.trim();
        if (!usernameValue) {
            hasError = true;
            usernameError.textContent = 'Username is required';
        } else if (usernameValue.length < 3) {
            hasError = true;
            usernameError.textContent = 'Username must be at least 3 characters';
        }

        // Password validation
        const passwordValue = password.value.trim();
        if (!passwordValue) {
            hasError = true;
            passwordError.textContent = 'Password is required';
        } else if (passwordValue.length < 6) {
            hasError = true;
            passwordError.textContent = 'Password must be at least 6 characters';
        }

        // If no validation errors, proceed with registration
        if (!hasError) {
            try {
                // Show loading state
                const submitButton = form.querySelector('.signup-button');
                const originalText = submitButton.textContent;
                submitButton.textContent = 'Creating Account...';
                submitButton.disabled = true;

                // Send registration request to server
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email.value,
                        username: username.value,
                        password: password.value
                    })
                });

                const result = await response.json();

                if (response.ok) {
                    // Success - redirect to login page with success message
                    alert('Account created successfully! Please login with your new credentials.');
                    window.location.href = 'login.html';
                } else {
                    // Handle server errors
                    if (result.error === 'Email already exists') {
                        emailError.textContent = result.error;
                    } else if (result.error === 'Invalid email format') {
                        emailError.textContent = result.error;
                    } else if (result.error === 'Password must be at least 6 characters long') {
                        passwordError.textContent = result.error;
                    } else {
                        // General error
                        emailError.textContent = result.error || 'Registration failed. Please try again.';
                    }
                }

                // Reset button state
                submitButton.textContent = originalText;
                submitButton.disabled = false;

            } catch (error) {
                console.error('Registration error:', error);
                emailError.textContent = 'Network error. Please check your connection and try again.';
                
                // Reset button state
                const submitButton = form.querySelector('.signup-button');
                submitButton.textContent = 'Sign Up';
                submitButton.disabled = false;
            }
        }
    });
}

// Initialize signup validation when page loads
document.addEventListener('DOMContentLoaded', function() {
    signupValidation();
});