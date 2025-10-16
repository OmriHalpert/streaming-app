// Main router (/)
// Imports
const { Router } = require("express");
const {
  renderProfilesPage,
  renderManageProfilesPage,
} = require("../controllers/profilesController.js");
const {
  renderLoginPage,
  renderSignupPage,
  logout,
} = require("../controllers/authController.js");
const { renderFeedPage } = require("../controllers/feedController.js");
const { renderContentDetailsPage } = require("../controllers/contentDetailsController.js");
const {
  requirePageOwnership,
  redirectIfAuthenticated,
} = require("../middleware/auth"); // Import authentication middleware

// Declarations
const pagesRouter = Router();

// Page routes (render EJS templates)
// Protected routes - Require authentication AND ownership
pagesRouter.get("/profiles", requirePageOwnership, renderProfilesPage);
pagesRouter.get(
  "/manage-profiles",
  requirePageOwnership,
  renderManageProfilesPage
);
pagesRouter.get("/feed", requirePageOwnership, renderFeedPage);
pagesRouter.get("/content/:contentId", requirePageOwnership, renderContentDetailsPage);

// Public routes - Redirect if already authenticated
pagesRouter.get("/login", redirectIfAuthenticated, renderLoginPage);
pagesRouter.get("/signup", redirectIfAuthenticated, renderSignupPage);

// Logout route
pagesRouter.get("/logout", logout);

module.exports = { pagesRouter };
