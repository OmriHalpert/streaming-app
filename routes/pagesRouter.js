const { Router } = require('express');
const { renderProfilesPage } = require('../controllers/profilesController.js');

const pagesRouter = Router();

// Page routes (render EJS templates)
pagesRouter.get('/profiles', renderProfilesPage);

// Logout route (add logic as needed)
pagesRouter.get('/logout', (req, res) => {
    // Clear any server-side session data here if needed
    res.redirect('/html/login.html');
});

// Add future page routes here:
// pagesRouter.get('/dashboard', renderDashboard);
// pagesRouter.get('/settings', renderSettings);

module.exports = { pagesRouter };