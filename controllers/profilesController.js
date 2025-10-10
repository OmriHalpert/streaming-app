const UserService = require("../services/userService");

// Render profiles page
async function renderProfilesPage(req, res) {
  try {
    const userId = req.query.userId;

    // Redirect to login if no userId provided
    if (!userId) {
      console.log("No userId provided in query parameters.");
      return res.redirect("/login");
    }

    // TODO: Add proper session validation when express-session is implemented

    try {
      const { user, profiles } = await UserService.getUserWithProfiles(
        parseInt(userId)
      );

      res.render("profiles", { profiles, user });
    } catch (error) {
      console.log("Could not fetch user data:", error.message);
      return res.redirect("/login");
    }
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

    // TODO: Add proper session validation when express-session is implemented

    try {
      const { user, profiles } = await UserService.getUserWithProfiles(
        parseInt(userId)
      );

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
      const newProfile = await UserService.addProfile(parseInt(userId), profileName);
      
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

module.exports = {
  renderProfilesPage,
  renderManageProfilesPage,
  addProfile,
};
