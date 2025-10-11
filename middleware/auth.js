// Authentication middleware for protected routes
function requireAuth(req, res, next) {
    if (req.session && req.session.user) {
        // User is authenticated
        return next();
    } else {
        // User is not authenticated
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }
}

// Ensure user can only access their own data
function requireOwnership(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }

    // Get userId from different possible sources
    const requestedUserId = req.params.id || req.params.userId || req.body.userId || req.query.userId;
    const loggedInUserId = req.session.user.id;

    // Convert to numbers for comparison (in case one is string)
    if (parseInt(requestedUserId) !== parseInt(loggedInUserId)) {
        return res.status(403).json({
            error: 'Access denied',
            message: 'You can only access your own data'
        });
    }

    // User owns this data, proceed
    next();
}

// Combined middleware - authentication + ownership check
function requireAuthAndOwnership(req, res, next) {
    requireAuth(req, res, (err) => {
        if (err) return next(err);
        requireOwnership(req, res, next);
    });
}

// Page-specific authorization - redirects instead of JSON errors
function requirePageOwnership(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }

    // Get userId from query parameters (common for page routes)
    const requestedUserId = req.query.userId;
    const loggedInUserId = req.session.user.id;

    // Convert to numbers for comparison (in case one is string)
    if (parseInt(requestedUserId) !== parseInt(loggedInUserId)) {
        // Redirect to their own page instead of showing error
        const currentPath = req.path;
        return res.redirect(`${currentPath}?userId=${loggedInUserId}`);
    }

    // User owns this data, proceed
    next();
}

// Profile ownership middleware - for profile-specific operations
function requireProfileOwnership(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ 
            error: 'Authentication required',
            message: 'Please log in to access this resource'
        });
    }

    // For profile operations, check if the profileId belongs to the logged-in user
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

// Middleware to check if user is already logged in (for login/register pages)
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
        // User is already logged in, redirect to profiles
        return res.redirect(`/profiles?userId=${req.session.user.id}`);
    } else {
        // User is not logged in, proceed to login/register page
        return next();
    }
}

// Middleware to add user info to templates (for EJS views)
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