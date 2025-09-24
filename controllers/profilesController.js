const UserService = require('../services/userService');

// Render profiles page
async function renderProfilesPage(req, res) {
    try {
        const userId = req.query.userId;
        
        // Redirect to login if no userId provided
        if (!userId) {
            console.log('No userId provided in query parameters.');
            return res.redirect('/html/login.html');
        }

        // TODO: Add proper session validation when express-session is implemented
        
        try {
            const { user, profiles } = await UserService.getUserWithProfiles(parseInt(userId));
            
            res.render('profiles', { profiles, user });
            
        } catch (error) {
            console.log('Could not fetch user data:', error.message);
            return res.redirect('/html/login.html');
        }
        
    } catch (error) {
        console.error('Error rendering profiles page:', error);
        res.redirect('/html/login.html');
    }
}

module.exports = {
    renderProfilesPage
};