// Statistics router (/api/stats)
// Imports
const { Router } = require("express");
const { getDailyViews, getGenreStats } = require('../controllers/statisticsController.js');
const { requireAuth, requireAuthAndOwnership } = require("../middleware/auth"); // Import authentication middleware

// Declarations
const statsRouter = Router();

// Protected routes - Require authentication and ownership
statsRouter.get("/daily-views", requireAuthAndOwnership, getDailyViews);
statsRouter.get("/genre-popularity", requireAuthAndOwnership, getGenreStats);

module.exports = { statsRouter };
