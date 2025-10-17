// Imports
const express = require("express");
const { saveProgress, clearProgress, getProfileInteractions } = require("../services/profileInteractionService");
const { requireAuth } = require("../middleware/auth");

const progressRouter = express.Router();

// Save progress
progressRouter.post("/save", requireAuth, async (req, res) => {
  try {
    const { userId, profileId, contentId, contentType, lastPositionSec, isCompleted, season, episode } = req.body;

    const result = await saveProgress(
      userId,
      profileId,
      contentId,
      contentType,
      lastPositionSec,
      isCompleted || false,
      season,
      episode
    );

    res.json(result);
  } catch (error) {
    console.error("Error saving progress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear progress (removes ALL episodes for shows)
progressRouter.delete("/clear", requireAuth, async (req, res) => {
  try {
    const { userId, profileId, contentId, contentType } = req.body;

    const result = await clearProgress(
      userId,
      profileId,
      contentId,
      contentType
    );

    res.json(result);
  } catch (error) {
    console.error("Error clearing progress:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get profile interactions (likes and progress)
progressRouter.get("/interactions", requireAuth, async (req, res) => {
  try {
    const { userId, profileId } = req.query;

    const interactions = await getProfileInteractions(
      userId,
      profileId
    );

    res.json({ success: true, data: interactions });
  } catch (error) {
    console.error("Error getting interactions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { progressRouter };
