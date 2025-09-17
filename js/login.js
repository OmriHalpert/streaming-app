
function loginValidation() {
    const form = document.querySelector('#login-form');
    const email = document.querySelector('#email');
    const password = document.querySelector('#password');
    const emailError = document.querySelector('#email-error');
    const passwordError = document.querySelector('#password-error');

    // Clears fields
    const clearErrors = () => {
        emailError.textContent = '';
        passwordError.textContent = '';
    }

    form.addEventListener('submit', (e) => {
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

        // Password validation
        const value = password.value.trim();
        if (!value) {
            hasError = true;
            passwordError.textContent = 'Password is required.';
        } else if (value.length < 6) {
            hasError = true;
            passwordError.textContent = 'Password must be at least 6 characters.';
        }

        // Block submission if any errors exist
        if (hasError) {
            e.preventDefault();
        }

        localStorage.setItem('')
    })
}

loginValidation();