// Imports
const {
  register: registerUser,
  login: loginUser,
} = require("../services/userService");
const { logAuth } = require("../services/loggerService");

// Helper functions
// Handle auth-related errors
function handleAuthError(error, res, context = "authentication") {
  console.error(`${context} error:`, error);

  // Define validation error messages
  const validationErrors = [
    "All fields are required",
    "Invalid email format",
    "Email must be at least 5 characters",
    "Email must be no more than 254 characters",
    "Username must be at least 3 characters",
    "Username must be no more than 30 characters",
    "Password must be at least 5 characters",
    "Password must be no more than 128 characters",
    "Email already exists",
    "Username already exists",
    "User does not exist",
    "Incorrect Password",
  ];

  // Handle specific error types
  if (validationErrors.includes(error.message)) {
    return res.status(400).json({ error: error.message });
  }

  // Handle server errors
  const serverMessage =
    context === "registration"
      ? "Server error - failed to create user"
      : "Server error - failed to login";
  return res.status(500).json({ error: serverMessage });
}

// Main functions
// Render login page
async function renderLoginPage(req, res) {
  try {
    res.render("login");
  } catch (error) {
    console.error("Error rendering login page:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Render signup page
async function renderSignupPage(req, res) {
  try {
    res.render("signup");
  } catch (error) {
    console.error("Error rendering signup page:", error);
    res.status(500).send("Internal Server Error");
  }
}

// Register controller
async function register(req, res) {
  try {
    const { email, username, password } = req.body;

    // Register user via services
    const user = await registerUser(email, username, password);

    // Return success response
    return res.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    return handleAuthError(error, res, "registration");
  }
}

// Login controller
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Login user via services
    const user = await loginUser(username, password);

    // Create session and store user data in it
    req.session.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      profiles: user.profiles,
    };

    // Return success response
    return res.status(200).json({
      message: "Login successful",
      user: user,
    });
  } catch (error) {
    return handleAuthError(error, res, "login");
  }
}

// Logout controller - destroy session and redirect to login
async function logout(req, res) {
  try {
    // Get user info before destroying session
    const userId = req.session?.user?.id || "unknown";
    const userName = req.session?.user?.username || "unknown";

    // Log the logout attempt
    logAuth("info", "User logout initiated", {
      userId: userId,
      username: userName,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      action: "logout_initiated",
    });

    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);

        // Log logout failure
        logAuth("error", "User logout failed - session destruction error", {
          userId: userId,
          username: userName,
          ip: req.ip,
          error: err.message,
          action: "logout_failure",
        });
      } else {
        // Log successful logout
        logAuth("info", "User logout successful", {
          userId: userId,
          userName: userName,
          ip: req.ip,
          action: "logout_success",
        });
      }

      // Clear the session cookie
      res.clearCookie("connect.sid");

      // Redirect to login page
      res.redirect("/login");
    });
  } catch (error) {
    console.error("Logout error:", error);

    // Log logout error
    logAuth("error", "User logout failed - unexpected error", {
      userId: req.session?.user?.id || "unknown",
      ip: req.ip,
      error: error.message,
      action: "logout_error",
    });

    // Even if there's an error, redirect to login
    res.redirect("/login");
  }
}

module.exports = {
  renderLoginPage,
  renderSignupPage,
  register,
  login,
  logout,
};
