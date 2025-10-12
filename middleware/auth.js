// Check if user is logged in
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }
}

// Helper to check authentication
function isAuthenticated(req) {
    return req.session && req.session.user;
}

// Verify user can only access their own data
function requireOwnership(req, res, next) {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }

    const requestedUserId = req.params.id || req.params.userId || req.body.userId || req.query.userId;
    const loggedInUserId = req.session.user.id;

    if (parseInt(requestedUserId) !== parseInt(loggedInUserId)) {
        return res.status(403).json({
            error: 'Access denied',
            message: 'You can only access your own data'
        });
    }

    next();
}

// Authentication + ownership combined
function requireAuthAndOwnership(req, res, next) {
    requireAuth(req, res, (err) => {
        if (err) return next(err);
        requireOwnership(req, res, next);
    });
}

// Page ownership check with redirect instead of JSON error
function requirePageOwnership(req, res, next) {
    if (!isAuthenticated(req)) {
        return res.redirect('/login');
    }

    const requestedUserId = req.query.userId;
    const loggedInUserId = req.session.user.id;

    if (parseInt(requestedUserId) !== parseInt(loggedInUserId)) {
        const currentPath = req.path;
        return res.redirect(`${currentPath}?userId=${loggedInUserId}`);
    }

    next();
}

// Check if user owns the specific profile
function requireProfileOwnership(req, res, next) {
    if (!isAuthenticated(req)) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }

    const profileId = parseInt(req.body.profileId || req.params.profileId || req.query.profileId);
    const userProfiles = req.session.user.profiles || [];
    
    const ownsProfile = userProfiles.some(profile => parseInt(profile.id) === profileId);
    
    if (!ownsProfile) {
        return res.status(403).json({
            error: 'Access denied',
            message: 'You can only access your own profiles'
        });
    }

    next();
}

// Redirect logged-in users away from login/signup pages
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        return res.redirect(`/profiles?userId=${req.session.user.id}`);
    } else {
        return next();
    }
}

// Make user data available in EJS templates
function addUserToLocals(req, res, next) {
    res.locals.user = req.session ? req.session.user : null;
    res.locals.isAuthenticated = !!(req.session && req.session.user);
    next();
}

module.exports = {
    requireAuth,
    requireOwnership,
    requireAuthAndOwnership,
    requirePageOwnership,
    requireProfileOwnership,
    redirectIfAuthenticated,
    addUserToLocals
};