// Helper funcs
// Check authentication
function isAuthenticated(req) {
  return req.session && req.session.user;
}

// Verify user can only access their own data
function requireOwnership(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource",
    });
  }

  const requestedUserId =
    (req.params && req.params.id) || 
    (req.params && req.params.userId) || 
    (req.body && req.body.userId) || 
    (req.query && req.query.userId);
  const loggedInUserId = req.session.user.id;

  if (parseInt(requestedUserId) !== parseInt(loggedInUserId)) {
    return res.status(403).json({
      error: "Access denied",
      message: "You can only access your own data",
    });
  }

  next();
}

// Main functions
// Check if user is logged in
function requireAuth(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    return res.status(401).json({
      error: "Authentication required",
      message: "Please log in to access this resource",
    });
  }
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
    return res.redirect("/login");
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
      error: "Authentication required",
      message: "Please log in to access this resource",
    });
  }

  const profileIdParam = (req.body && req.body.profileId) || 
                         (req.params && req.params.profileId) || 
                         (req.query && req.query.profileId);
  
  if (!profileIdParam) {
    return res.status(400).json({
      error: "Bad request",
      message: "profileId is required",
    });
  }

  const profileId = parseInt(profileIdParam);
  const userProfiles = req.session.user.profiles || [];

  const ownsProfile = userProfiles.some(
    (profile) => parseInt(profile.id) === profileId
  );

  if (!ownsProfile) {
    return res.status(403).json({
      error: "Access denied",
      message: "You can only access your own profiles",
    });
  }

  next();
}

// Redirect logged-in users away from login/signup pages
function redirectIfAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    // Admin users (userId = 0) should go to admin page
    if (parseInt(req.session.user.id) === 0) {
      return res.redirect('/admin');
    }
    // Regular users go to profiles
    return res.redirect(`/profiles?userId=${req.session.user.id}`);
  } else {
    return next();
  }
}

// Check if user is admin (userId = 0)
function requireAdminAuth(req, res, next) {
  if (!isAuthenticated(req)) {
    return res.redirect("/login");
  }

  const loggedInUserId = req.session.user.id;

  // Check if user is admin (userId = 0)
  if (parseInt(loggedInUserId) !== 0) {
    return res.status(403).render("error", {
      error: "Access Denied",
      message: "You are not allowed to access here",
      statusCode: 403
    });
  }

  next();
}

// Make user data available in EJS templates
function addUserToLocals(req, res, next) {
  res.locals.user = req.session ? req.session.user : null;
  res.locals.isAuthenticated = !!(req.session && req.session.user);
  next();
}

module.exports = {
  requireAuth,
  requireAuthAndOwnership,
  requirePageOwnership,
  requireProfileOwnership,
  redirectIfAuthenticated,
  requireAdminAuth,
  addUserToLocals,
};
