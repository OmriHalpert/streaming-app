// Imports
const loggerService = require("../services/loggerService");

// Middleware to log HTTP requests
function logRequest(req, res, next) {
  const startTime = Date.now();

  // Log the request using the helper function
  loggerService.logHttp("info", "HTTP Request", {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: req.session?.user?.id ?? null,
    action: "request",
  });

  // Log response when it finishes
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    loggerService.logHttp("info", "HTTP Response", {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.session?.user?.id ?? null,
      action: "response",
    });
  });

  next();
}

// Middleware to log auhentication events (except logout, handled on authController)
function logAuthEvents(req, res, next) {
  // Store original json method to intercept responses
  const originalJson = res.json;

  res.json = function (data) {
    // Check if this is an auth related endpoint
    if (req.path.includes("/login") || req.path.includes("/register")) {
      if (res.statusCode === 200 || res.statusCode === 201) {
        // Success
        if (req.path.includes("/login")) {
          loggerService.logAuth("info", "User login successful", {
            userId: data.user?.id ?? "unknown",
            email: data.user?.email || req.body?.email,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            action: "login_success",
          });
        } else if (req.path.includes("/register")) {
          loggerService.logAuth("info", "User registration successful", {
            userId: data.user?.id ?? "unknown",
            email: data.user?.email || req.body?.email,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            action: "register_success",
          });
        }
      } else {
        // Failure
        if (req.path.includes("/login")) {
          loggerService.logAuth("warn", "User login failed", {
            email: req.body?.email || "unknown",
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            action: "login_failure",
            reason: data?.error || data?.message || "Unknown error",
          });
        } else if (req.path.includes("/register")) {
          loggerService.logAuth("warn", "User registration failed", {
            email: req.body?.email || "unknown",
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            action: "register_failure",
            reason: data?.error || data?.message || "Unknown error",
          });
        }
      }
    }

    // Call original json method
    return originalJson.call(this, data);
  };

  next();
}

// Error logging middleware
function logErrors(err, req, res, next) {
  loggerService.logError("Application error occurred", err, {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.session?.user?.id ?? null,
    userAgent: req.get("User-Agent"),
  });

  next(err); // Pass error to next error event handler
}

module.exports = {
  logRequest,
  logAuthEvents,
  logErrors,
};
