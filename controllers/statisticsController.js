// Imports
const { getDailyViewsPerProfile, getGenrePopularity } = require('../services/statisticsService.js');

// Main functions
// Handles call for daily views for user profiles
async function getDailyViews(req, res) {
    try {
        const userId = req.session.user.id; // Get from session, not client

        const data = await getDailyViewsPerProfile(userId);

        // Return success response with the new profile
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("Error fetching daily views:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error. Please try again.",
        });
    }
}

// Handles call for genre stats for user profiles
async function getGenreStats(req, res) {
    try {
        const userId = req.session.user.id; // Get from session, not client

        const data = await getGenrePopularity(userId);

        // Return success response with the new profile
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error("Error fetching genre stats:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error. Please try again.",
        });
    }
}

module.exports = {
    getDailyViews,
    getGenreStats
}