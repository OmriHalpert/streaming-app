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

  if (trimmedPassword.length < 5 || trimmedPassword.length > 128) {
    throw new Error(
      trimmedPassword.length < 5
        ? "Password must be at least 5 characters"
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
async function login(username, password) {
  // Input validation
  if (!username || !password) {
    throw new Error("All fields are required");
  }

  // Trim inputs
  const trimmedUsername = username.trim();
  const trimmedPassword = password.trim();

  // Length validations
  if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
    throw new Error(
      trimmedUsername.length < 3
        ? "Username must be at least 3 characters"
        : "Username must be no more than 30 characters"
    );
  }

  if (trimmedPassword.length < 5 || trimmedPassword.length > 128) {
    throw new Error(
      trimmedPassword.length < 5
        ? "Password must be at least 5 characters"
        : "Password must be no more than 128 characters"
    );
  }

  return await usersModel.login(trimmedUsername, trimmedPassword);
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

// Update user information
async function updateUser(userId, updateData) {
  try {
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid user ID");
    }

    // Validate at least one field is being updated
    if (!updateData.email && !updateData.username && !updateData.password) {
      throw new Error("At least one field must be provided for update");
    }

    const trimmedData = {};

    // Validate and trim email
    if (updateData.email !== undefined) {
      const trimmedEmail = updateData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      if (!emailRegex.test(trimmedEmail)) {
        throw new Error("Invalid email format");
      }
      
      if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
        throw new Error(
          trimmedEmail.length < 5
            ? "Email must be at least 5 characters"
            : "Email must be no more than 254 characters"
        );
      }
      
      trimmedData.email = trimmedEmail;
    }

    // Validate and trim username
    if (updateData.username !== undefined) {
      const trimmedUsername = updateData.username.trim();
      
      if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
        throw new Error(
          trimmedUsername.length < 3
            ? "Username must be at least 3 characters"
            : "Username must be no more than 30 characters"
        );
      }
      
      trimmedData.username = trimmedUsername;
    }

    // Validate and trim password
    if (updateData.password !== undefined) {
      const trimmedPassword = updateData.password.trim();
      
      if (trimmedPassword.length < 5 || trimmedPassword.length > 128) {
        throw new Error(
          trimmedPassword.length < 5
            ? "Password must be at least 5 characters"
            : "Password must be no more than 128 characters"
        );
      }
      
      trimmedData.password = trimmedPassword;
    }

    return await usersModel.updateUser(userId, trimmedData);
  } catch (error) {
    throw error;
  }
}

// Delete user and all associated data
async function deleteUser(userId) {
  try {
    // Validate user ID
    if (isNaN(userId) || userId <= 0) {
      throw new Error("Invalid user ID");
    }

    // Get user to find all their profiles
    const user = await usersModel.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete all profile interactions for each profile
    for (const profile of user.profiles) {
      await profileInteractionService.deleteProfileInteractions(userId, profile.id);
    }

    // Delete the user
    return await usersModel.deleteUser(userId);
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
  updateUser,
  deleteUser,
};
