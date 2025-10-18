// Statistics router (/api/stats)
// Imports
const { Router } = require("express");
const { getDailyViews, getGenreStats } = require('../controllers/statisticsController.js');
const { requireAuth } = require("../middleware/auth"); // Import authentication middleware

// Declarations
const statsRouter = Router();

// Protected routes - Require authentication
statsRouter.get("/daily-views", requireAuth, getDailyViews);
statsRouter.get("/genre-popularity", requireAuth, getGenreStats);

module.exports = { statsRouter };
