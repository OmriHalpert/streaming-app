// DOM element references - shared across functions
const form = document.querySelector("#login-form");
const username = document.querySelector("#username");
const password = document.querySelector("#password");
const usernameError = document.querySelector("#username-error");
const passwordError = document.querySelector("#password-error");
const submitButton = document.querySelector(".login-button");

// Main functions
// Validates login operation
function loginValidation() {
  // Clears fields
  const clearErrors = () => {
    usernameError.textContent = "";
    passwordError.textContent = "";
  };

  // On submit
  form.addEventListener("submit", (e) => {
    e.preventDefault(); 
    clearErrors();
    let hasError = false;

    // Basic frontend validation for immediate user feedback
    if (!username.value) {
      hasError = true;
      usernameError.textContent = "Username is required";
    }

    if (!password.value) {
      hasError = true;
      passwordError.textContent = "Password is required";
    }

    // If no validation errors, proceed with login
    if (!hasError) {
      loginUser(username.value, password.value);
    }
  });
}

// handles API login
async function loginUser(username, password) {
  // Store original button text
  const originalText = submitButton.textContent;

  try {
    // Show loading state
    submitButton.textContent = "Logging in...";
    submitButton.disabled = true;

    // Use API service for login
    const result = await UserAPI.loginUser(username, password);

    console.log('output: ', result);

    if (result.success) {
      // Success - store complete user session and redirect
      const userSession = {
        isLoggedIn: true,
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        profiles: result.user.profiles,
      };

      localStorage.setItem("userSession", JSON.stringify(userSession));

      // Redirect to admin page for admin users, otherwise to profiles
      if (username === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = `/profiles?userId=${result.user.id}`;
      }
    } else {
      // Handle server validation errors
      if (result.error === "User does not exist") {
        usernameError.textContent = "No account found with this username";
      } else if (
        result.error.includes("Password") ||
        result.error.includes("password") ||
        result.error === "Incorrect Password"
      ) {
        passwordError.textContent = result.error;
      } else {
        usernameError.textContent =
          result.error || "Login failed. Please try again.";
      }
    }
  } catch (error) {
    console.error("Login error:", error);
    usernameError.textContent = "General error. Please try again.";
  } finally {
    // Reset button state
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
}

// Initialize login when page loads
document.addEventListener("DOMContentLoaded", () => {
  loginValidation();
});
