// DOM element references - shared across functions
const form = document.querySelector("#signup-form");
const email = document.querySelector("#email");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const emailError = document.querySelector("#email-error");
const usernameError = document.querySelector("#username-error");
const passwordError = document.querySelector("#password-error");
const submitButton = document.querySelector(".signup-button");

// Main functions
// Signup functionality
function signupValidation() {
  // Clear error messages
  const clearErrors = () => {
    emailError.textContent = "";
    usernameError.textContent = "";
    passwordError.textContent = "";
  };

  // On Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Always prevent default form submission
    clearErrors();
    let hasError = false;

    // Basic frontend validation for immediate user feedback
    if (!email.value) {
      hasError = true;
      emailError.textContent = "Email is required";
    }

    if (!username.value) {
      hasError = true;
      usernameError.textContent = "Username is required";
    }

    if (!password.value) {
      hasError = true;
      passwordError.textContent = "Password is required";
    }

    // If no validation errors, proceed with registration
    if (!hasError) {
      registerUser(email.value, username.value, password.value);
    }
  });
}

// Handle API registration
async function registerUser(email, username, password) {
  // Store original button text
  const originalText = submitButton.textContent;

  try {
    // Show loading state
    submitButton.textContent = "Creating Account...";
    submitButton.disabled = true;

    // Send registration request to server using API
    const result = await UserAPI.registerUser(email, username, password);

    if (result.success) {
      // Success - redirect to login page with success message
      alert(
        "Account created successfully! Please login with your credentials."
      );
      window.location.href = "/login";
    } else {
      // Handle server validation errors
      if (
        result.error.includes("email") ||
        result.error === "Email already exists" ||
        result.error === "Invalid email format"
      ) {
        emailError.textContent = result.error;
      } else if (
        result.error.includes("Username") ||
        result.error.includes("username")
      ) {
        usernameError.textContent = result.error;
      } else if (
        result.error.includes("Password") ||
        result.error.includes("password")
      ) {
        passwordError.textContent = result.error;
      } else {
        // General error
        emailError.textContent =
          result.error || "Registration failed. Please try again.";
      }
    }
  } catch (error) {
    console.error("Registration error:", error);
    emailError.textContent = "General error. Please try again.";
  } finally {
    // Reset button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

// Initialize signup when page loads
document.addEventListener("DOMContentLoaded", function () {
  signupValidation();
});
