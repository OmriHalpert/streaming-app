const { getUserById, getUserProfiles: getUserProfilesService, addProfile: addProfileService, updateUserProfile, deleteUserProfile } = require("../services/userService");

// Make internal API calls
async function makeInternalAPICall(url) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${baseUrl}${url}`);
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Internal API call failed for ${url}:`, error.message);
    throw error;
  }
}

// Render profiles page
async function renderProfilesPage(req, res) {
  try {
    const userId = req.query.userId;

    // Redirect to login if no userId provided
    if (!userId) {
      console.log("No userId provided in query parameters.");
      return res.redirect("/login");
    }

    // Renders page
    res.render("profiles", { userId });
    
  } catch (error) {
    console.error("Error rendering profiles page:", error);
    res.redirect("/login");
  }
}

// Render manage profiles page
async function renderManageProfilesPage(req, res) {
  console.log("=== MANAGE PROFILES DEBUG START ===");
  console.log("Query parameters:", req.query);
  
  try {
    const userId = req.query.userId;
    console.log("Extracted userId:", userId);

    // Redirect to login if no userId provided
    if (!userId) {
      console.log("No userId provided in query parameters.");
      return res.redirect("/login");
    }

    console.log("userId check passed, proceeding to API calls...");

    // TODO: Add proper session validation when express-session is implemented

    try {
      // Fetch user data via internal API calls
      console.log(`Debug: Trying to fetch user with ID: ${userId}`);
      const userResponse = await makeInternalAPICall(`/api/users/${userId}`);
      const profilesResponse = await makeInternalAPICall(`/api/users/${userId}/profiles`);
      
      const user = userResponse.user;
      const profiles = profilesResponse.profiles;

      console.log("API calls successful, rendering page...");
      res.render("manage-profiles", { profiles, user });
    } catch (error) {
      console.log("Could not fetch user data:", error.message);
      return res.redirect("/login");
    }
  } catch (error) {
    console.error("Error rendering manage profiles page:", error);
    res.redirect("/login");
  }
}

async function addProfile(req, res) {
  try {
    const userId = req.query.userId || req.body.userId;
    const profileName = req.body.profileName;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!profileName) {
      return res.status(400).json({
        success: false,
        error: 'Profile name is required'
      });
    }

    try {
      // Add the new profile using UserService
      const newProfile = await addProfileService(parseInt(userId), profileName);
      
      // Return success response with the new profile
      res.json({
        success: true,
        message: 'Profile added successfully',
        data: {
          profile: newProfile
        }
      });

    } catch (error) {
      console.log("Could not add profile:", error.message);
      
      // Handle specific error cases
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      if (error.message === 'Maximum number of profiles (5) reached') {
        return res.status(400).json({
          success: false,
          error: 'Maximum number of profiles reached. You can only have up to 5 profiles.'
        });
      }
      
      // Generic validation errors
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
  } catch (error) {
    console.error("Error adding profile:", error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.query.userId || req.body.userId;
    const profileId = req.body.profileId;
    const profileName = req.body.profileName;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Profile ID is required'
      });
    }

    if (!profileName) {
      return res.status(400).json({
        success: false,
        error: 'Profile name is required'
      });
    }

    try {
      // Update the profile using UserService
      const updatedProfile = await updateUserProfile(
        parseInt(userId),
        parseInt(profileId),
        profileName
      );
      
      // Return success response with the updated profile
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          profile: updatedProfile
        }
      });

    } catch (error) {
      console.log("Could not update profile:", error.message);
      
      // Handle specific error cases
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      if (error.message === 'Profile not found') {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }
      
      // Generic validation errors
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}

async function deleteProfile(req, res) {
  try {
    const userId = req.query.userId || req.body.userId;
    const profileId = req.body.profileId;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: 'Profile ID is required'
      });
    }

    try {
      // Delete the profile using UserService
      const deletedProfile = await deleteUserProfile(
        parseInt(userId),
        parseInt(profileId)
      );
      
      // Return success response with the deleted profile
      res.json({
        success: true,
        message: 'Profile deleted successfully',
        data: {
          profile: deletedProfile
        }
      });

    } catch (error) {
      console.log("Could not delete profile:", error.message);
      
      // Handle specific error cases
      if (error.message === 'User not found') {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      if (error.message === 'Profile not found') {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }
      
      // Generic validation errors
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again.'
    });
  }
}

module.exports = {
  renderProfilesPage,
  renderManageProfilesPage,
  addProfile,
  updateProfile,
  deleteProfile,
};
