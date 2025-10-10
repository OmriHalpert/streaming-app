const { Router } = require('express');
const { renderProfilesPage } = require('../controllers/profilesController.js');
const { renderLoginPage } = require('../controllers/loginController.js');
const { renderSignupPage } = require('../controllers/signupController.js');
const { renderFeedPage } = require('../controllers/feedController.js');

const pagesRouter = Router();

// Page routes (render EJS templates)
pagesRouter.get('/profiles', renderProfilesPage);
pagesRouter.get('/login', renderLoginPage);
pagesRouter.get('/signup', renderSignupPage);
pagesRouter.get('/feed', renderFeedPage);

// Logout route (add logic as needed)
pagesRouter.get('/logout', (req, res) => {
    // Clear any server-side session data here if needed
    res.redirect('/login');
});

// Add future page routes here:
// pagesRouter.get('/dashboard', renderDashboard);
// pagesRouter.get('/settings', renderSettings);

module.exports = { pagesRouter };