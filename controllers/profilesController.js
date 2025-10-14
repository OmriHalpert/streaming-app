// Imports
const {
  getUserById,
  getUserProfiles: getUserProfilesService,
  addProfile: addProfileService,
  updateUserProfile,
  deleteUserProfile,
} = require("../services/userService");

// Main functions
// Render profiles page
async function renderProfilesPage(req, res) {
  try {
    const userId = req.query.userId;

    // Redirect to login if no userId provided
    if (!userId) {
      console.log("No userId provided in query parameters.");
      return res.redirect("/login");
    }

    // Renders profiles page
    res.render("profiles", { userId });
  } catch (error) {
    console.error("Error rendering profiles page:", error);
    res.redirect("/login");
  }
}

// Render manage profiles page
async function renderManageProfilesPage(req, res) {
  try {
    const userId = req.query.userId;

    // Redirect to login if no userId provided
    if (!userId) {
      console.log("No userId provided in query parameters.");
      return res.redirect("/login");
    }

    try {
      const user = await getUserById(parseInt(userId));
      const profiles = await getUserProfilesService(parseInt(userId));

      // Render manage profiles page
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

// Adds a new profile
async function addProfile(req, res) {
  try {
    const userId = req.query.userId || req.body.userId;
    const profileName = req.body.profileName;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    if (!profileName) {
      return res.status(400).json({
        success: false,
        error: "Profile name is required",
      });
    }

    try {
      // Add the new profile using user service
      const newProfile = await addProfileService(parseInt(userId), profileName);

      // Update session with new profile list
      if (
        req.session &&
        req.session.user &&
        req.session.user.id === parseInt(userId)
      ) {
        // Add the new profile to the session
        req.session.user.profiles.push(newProfile);
      }

      // Return success response with the new profile
      res.json({
        success: true,
        message: "Profile added successfully",
        data: {
          profile: newProfile,
        },
      });
    } catch (error) {
      console.log("Could not add profile:", error.message);

      // Handle specific error cases
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      if (error.message === "Maximum number of profiles (5) reached") {
        return res.status(400).json({
          success: false,
          error:
            "Maximum number of profiles reached. You can only have up to 5 profiles.",
        });
      }

      // Generic validation errors
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error adding profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again.",
    });
  }
}

// Updates a profile's name
async function updateProfile(req, res) {
  try {
    const userId = req.query.userId || req.body.userId;
    const profileId = req.body.profileId;
    const profileName = req.body.profileName;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: "Profile ID is required",
      });
    }

    if (!profileName) {
      return res.status(400).json({
        success: false,
        error: "Profile name is required",
      });
    }

    try {
      // Update the profile using user service
      const updatedProfile = await updateUserProfile(
        parseInt(userId),
        parseInt(profileId),
        profileName
      );

      // Update session with updated profile data
      if (
        req.session &&
        req.session.user &&
        req.session.user.id === parseInt(userId)
      ) {
        // Find and update the profile in the session
        const sessionProfile = req.session.user.profiles.find(
          (p) => p.id === parseInt(profileId)
        );
        if (sessionProfile) {
          sessionProfile.name = updatedProfile.name;
        }
      }

      // Return success response with the updated profile
      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          profile: updatedProfile,
        },
      });
    } catch (error) {
      console.log("Could not update profile:", error.message);

      // Handle specific error cases
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      if (error.message === "Profile not found") {
        return res.status(404).json({
          success: false,
          error: "Profile not found",
        });
      }

      // Generic validation errors
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again.",
    });
  }
}

// Deletes a profile
async function deleteProfile(req, res) {
  try {
    const userId = req.query.userId || req.body.userId;
    const profileId = req.body.profileId;

    // Validate inputs
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    if (!profileId) {
      return res.status(400).json({
        success: false,
        error: "Profile ID is required",
      });
    }

    try {
      // Delete the profile using user service
      const deletedProfile = await deleteUserProfile(
        parseInt(userId),
        parseInt(profileId)
      );

      // Update session by removing the deleted profile
      if (
        req.session &&
        req.session.user &&
        req.session.user.id === parseInt(userId)
      ) {
        // Remove the deleted profile from the session
        req.session.user.profiles = req.session.user.profiles.filter(
          (p) => p.id !== parseInt(profileId)
        );
      }

      // Return success response with the deleted profile
      res.json({
        success: true,
        message: "Profile deleted successfully",
        data: {
          profile: deletedProfile,
        },
      });
    } catch (error) {
      console.log("Could not delete profile:", error.message);

      // Handle specific error cases
      if (error.message === "User not found") {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      if (error.message === "Profile not found") {
        return res.status(404).json({
          success: false,
          error: "Profile not found",
        });
      }

      // Generic validation errors
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error. Please try again.",
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
