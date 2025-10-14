// Imports
const usersModel = require("../models/usersModel");
const profileInteractionService = require("./profileInteractionService");

// Main functions
// Get user by ID
async function getUserById(userId) {
  // Validate user ID
  if (isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const foundUser = await usersModel.findUserById(userId);

  // User not found
  if (!foundUser) {
    throw new Error("User not found");
  }

  // Return user data
  return {
    id: foundUser.id,
    email: foundUser.email,
    username: foundUser.username,
    profiles: foundUser.profiles || [],
  };
}

// Get user profiles by ID
async function getUserProfiles(userId) {
  // Validate user ID
  if (isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const foundUser = await usersModel.findUserById(userId);

  // User not found
  if (!foundUser) {
    throw new Error("User not found");
  }

  // Return user profiles list
  return foundUser.profiles || [];
}

// Register a new user
async function register(email, username, password) {
  // Input validation
  if (!email || !username || !password) {
    throw new Error("All fields are required");
  }

  // Trim inputs
  const trimmedEmail = email.trim();
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error("Invalid email format");
  }

  // Length validations
  if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
    throw new Error(
      trimmedEmail.length < 5
        ? "Email must be at least 5 characters"
        : "Email must be no more than 254 characters"
    );
  }

  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    throw new Error(
      trimmedUsername.length < 3
        ? "Username must be at least 3 characters"
        : "Username must be no more than 30 characters"
    );
  }

  if (trimmedPassword.length < 6 || trimmedPassword.length > 128) {
    throw new Error(
      trimmedPassword.length < 6
        ? "Password must be at least 6 characters"
        : "Password must be no more than 128 characters"
    );
  }

  return await usersModel.register(
    trimmedEmail,
    trimmedUsername,
    trimmedPassword
  );
}

// Login user
async function login(email, password) {
  // Input validation
  if (!email || !password) {
    throw new Error("All fields are required");
  }

  // Trim inputs
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    throw new Error("Invalid email format");
  }

  // Length validations
  if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
    throw new Error(
      trimmedEmail.length < 5
        ? "Email must be at least 5 characters"
        : "Email must be no more than 254 characters"
    );
  }

  if (trimmedPassword.length < 6 || trimmedPassword.length > 128) {
    throw new Error(
      trimmedPassword.length < 6
        ? "Password must be at least 6 characters"
        : "Password must be no more than 128 characters"
    );
  }

  return await usersModel.login(trimmedEmail, trimmedPassword);
}

// Add a new profile
async function addProfile(userId, profileName) {
  // Validate user ID
  if (isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  // Validate profile name
  if (!profileName || typeof profileName !== "string") {
    throw new Error("Profile name is required");
  }

  const trimmedProfileName = profileName.trim();

  // Profile name validations
  if (trimmedProfileName.length < 1 || trimmedProfileName.length > 12) {
    throw new Error(
      trimmedProfileName.length < 1
        ? "Profile name cannot be empty"
        : "Profile name must be no more than 12 characters"
    );
  }

  return await usersModel.addProfile(userId, trimmedProfileName);
}

// Updates a profile's name
async function updateUserProfile(userId, profileId, profileName) {
  // Validate user ID
  if (isNaN(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  // Validate profile ID
  if (isNaN(profileId) || profileId <= 0) {
    throw new Error("Invalid profile ID");
  }

  // Validate profile name
  if (!profileName || typeof profileName !== "string") {
    throw new Error("Profile name is required");
  }

  const trimmedProfileName = profileName.trim();

  // Profile name validations
  if (trimmedProfileName.length < 1 || trimmedProfileName.length > 12) {
    throw new Error(
      trimmedProfileName.length < 1
        ? "Profile name cannot be empty"
        : "Profile name must be no more than 12 characters"
    );
  }

  return await usersModel.updateUserProfile(
    userId,
    profileId,
    trimmedProfileName
  );
}

// Delete a user profile
async function deleteUserProfile(userId, profileId) {
  try {
    // Validate inputs
    if (!userId || !profileId) {
      throw new Error("User ID and profile ID are required");
    }

    // Delete the profile interactions
    await profileInteractionService.deleteProfileInteractions(
      userId,
      profileId
    );

    // Delete the profile from the user's profiles array
    const result = await usersModel.deleteUserProfile(
      parseInt(userId),
      parseInt(profileId)
    );

    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUserById,
  getUserProfiles,
  register,
  login,
  addProfile,
  updateUserProfile,
  deleteUserProfile,
};
