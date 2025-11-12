// Imports
const fs = require("fs").promises;
const path = require("path");
const User = require("./User"); // Imports the Mongoose User model
const bcrypt = require("bcrypt");

// Helper functions
// Find user by email
async function findUserByEmail(email) {
  return await User.findOne({ email: email.toLowerCase() });
}

async function findUserByUsername(username) {
  return await User.findOne({ username: username.toLowerCase() });
}

// Find user by ID
async function findUserById(userId) {
  return await User.findOne({ id: parseInt(userId) });
}

// Get next available user ID
async function getNextUserId() {
  const lastUser = await User.findOne().sort({ id: -1 });
  return lastUser ? lastUser.id + 1 : 1;
}

// Check if email exists
async function emailExists(email) {
  const user = await findUserByEmail(email);
  return !!user;
}

// Check if username exists
async function usernameExists(username) {
  const user = await findUserByUsername(username);
  return !!user;
}

// Generate a random avatar
async function generateRandomAvatar() {
  const profilePicsPath = path.join(
    __dirname,
    "../public/resources/profile_pics"
  );
  const profilePics = await fs.readdir(profilePicsPath);
  const randomAvatar =
    profilePics[Math.floor(Math.random() * profilePics.length)];
  return `/resources/profile_pics/${randomAvatar}`;
}

// Generate a new profile ID for a user
function generateNewProfileId(existingProfiles) {
  return existingProfiles.length > 0
    ? Math.max(...existingProfiles.map((p) => parseInt(p.id))) + 1
    : 1;
}

// Main functions
// Register a new user
async function register(email, username, password) {
  try {
    // Check if email already exists
    if (await emailExists(email)) {
      throw new Error("Email already exists");
    }

    // Check if username already exists
    if (await usernameExists(username)) {
      throw new Error("Username already exists");
    }

    // Generate new user ID
    const newUserId = await getNextUserId();

    // Generate random avatar
    const randomAvatar = await generateRandomAvatar();

    // Hash the password before saving
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 12);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      id: newUserId,
      email,
      username,
      password: hashedPassword,
      profiles: [
        {
          id: 1,
          name: "profile 1",
          avatar: randomAvatar,
        },
      ],
    });

    // Save user to MongoDB
    await newUser.save();

    // Return user data
    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      createdAt: newUser.createdAt,
    };
  } catch (error) {
    throw error;
  }
}

// Validate user login
async function login(username, password) {
  try {
    // Find user by email
    const foundUser = await findUserByUsername(username);
    if (!foundUser) {
      throw new Error("User does not exist");
    }

    // Validates password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      throw new Error("Incorrect Password");
    }

    // Return user data (without password)
    return {
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
      profiles: foundUser.profiles,
    };
  } catch (error) {
    throw error;
  }
}

// Add a new profile for a user
async function addProfile(userId, profileName) {
  try {
    // Find the user by ID
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check profile limit
    if (user.profiles.length >= 5) {
      throw new Error("Maximum number of profiles (5) reached");
    }

    // Generate new profile ID
    const newProfileId = generateNewProfileId(user.profiles);

    // Generate random avatar
    const randomAvatar = await generateRandomAvatar();

    const newProfile = {
      id: newProfileId,
      name: profileName,
      avatar: randomAvatar,
    };

    // Add profile to user
    user.profiles.push(newProfile);

    // Save the updated user
    await user.save();

    // Return the new profile
    return newProfile;
  } catch (error) {
    throw error;
  }
}

// Update user's profile name
async function updateUserProfile(userId, profileId, newProfileName) {
  try {
    // Find the user by ID
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Find relevant profile using profile ID
    const profile = user.profiles.find((p) => p.id === profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // Update the profile's name
    profile.name = newProfileName;

    // Save the updated user
    await user.save();

    // Returns the updated profile
    return profile;
  } catch (error) {
    throw error;
  }
}

// Delete a user's profile
async function deleteUserProfile(userId, profileId) {
  try {
    // Find the user by ID
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Fetch profiles list for pre-deletion validations
    const profilesList = user.profiles;

    // Check profile limit
    if (profilesList.length < 2) {
      throw new Error("User must have at least 1 profile");
    }

    // Check if profile exists
    const profileExists = profilesList.find((p) => p.id === profileId);
    if (!profileExists) {
      throw new Error("Profile not found");
    }

    // New Profiles list with deleted profile filtered out
    const newProfilesList = profilesList.filter(
      (profile) => profile.id !== profileId
    );

    // Saves new profiles list
    user.profiles = newProfilesList;
    await user.save();

    // Returns the deleted profile for confirmation
    return profileExists;
  } catch (error) {
    throw error;
  }
}

// Update user information
async function updateUser(userId, updateData) {
  try {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Update email if provided
    if (updateData.email !== undefined) {
      const lowercaseEmail = updateData.email.toLowerCase();
      // Check if new email already exists (and belongs to different user)
      const existingUser = await findUserByEmail(lowercaseEmail);
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already in use");
      }
      user.email = lowercaseEmail;
    }

    // Update username if provided
    if (updateData.username !== undefined) {
      const lowercaseUsername = updateData.username.toLowerCase();
      // Check if new username already exists (and belongs to different user)
      const existingUser = await findUserByUsername(lowercaseUsername);
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Username already in use");
      }
      user.username = lowercaseUsername;
    }

    // Update password if provided
    if (updateData.password !== undefined) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS, 12);
      user.password = await bcrypt.hash(updateData.password, saltRounds);
    }

    await user.save();

    // Return user data
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      profiles: user.profiles,
    };
  } catch (error) {
    throw error;
  }
}

// Delete user and all associated data
async function deleteUser(userId) {
  try {
    const user = await findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Delete user from database
    await User.deleteOne({ id: parseInt(userId) });

    // Return deleted user data for confirmation
    return {
      id: user.id,
      email: user.email,
      username: user.username,
    };
  } catch (error) {
    throw error;
  }
}

module.exports = {
  register,
  login,
  addProfile,
  updateUserProfile,
  deleteUserProfile,
  findUserByEmail,
  findUserById,
  emailExists,
  updateUser,
  deleteUser,
};
