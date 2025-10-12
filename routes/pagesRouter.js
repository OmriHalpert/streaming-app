const { Router } = require('express');
const { renderProfilesPage, renderManageProfilesPage } = require('../controllers/profilesController.js');
const { renderLoginPage } = require('../controllers/loginController.js');
const { renderSignupPage } = require('../controllers/signupController.js');
const { renderFeedPage } = require('../controllers/feedController.js');
const { logout } = require('../controllers/authController.js');

// Import authentication middleware
const { requirePageOwnership, redirectIfAuthenticated } = require('../middleware/auth');

const pagesRouter = Router();

// Page routes (render EJS templates)

// PROTECTED ROUTES - Require authentication AND ownership
pagesRouter.get('/profiles', requirePageOwnership, renderProfilesPage);
pagesRouter.get('/manage-profiles', requirePageOwnership, renderManageProfilesPage);
pagesRouter.get('/feed', requirePageOwnership, renderFeedPage);

// PUBLIC ROUTES - Redirect if already authenticated
pagesRouter.get('/login', redirectIfAuthenticated, renderLoginPage);
pagesRouter.get('/signup', redirectIfAuthenticated, renderSignupPage);

// Logout route
pagesRouter.get('/logout', logout);

// Add future page routes here:
// pagesRouter.get('/dashboard', renderDashboard);
// pagesRouter.get('/settings', renderSettings);

module.exports = { pagesRouter };