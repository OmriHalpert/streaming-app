// Imports
const { 
  saveProgress: saveProgressService, 
  clearProgress: clearProgressService, 
  getProfileInteractions: getProfileInteractionsService 
} = require("../services/profileInteractionService");

// Save progress
async function saveProgress(req, res) {
  try {
    const { profileId, contentId, contentType, lastPositionSec, isCompleted, season, episode } = req.body;
    const userId = req.session.user.id;

    // Validate required fields
    if (!profileId) {
      return res.status(400).json({ 
        success: false, 
        message: "Profile ID is required" 
      });
    }

    if (!contentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Content ID is required" 
      });
    }

    if (!contentType) {
      return res.status(400).json({ 
        success: false, 
        message: "Content type is required" 
      });
    }

    if (lastPositionSec === undefined || lastPositionSec === null) {
      return res.status(400).json({ 
        success: false, 
        message: "Last position is required" 
      });
    }

    // For shows, season and episode are required
    if (contentType === 'show' && (!season || !episode)) {
      return res.status(400).json({ 
        success: false, 
        message: "Season and episode are required for TV shows" 
      });
    }

    const result = await saveProgressService(
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
}

// Clear progress (removes ALL episodes for shows)
async function clearProgress(req, res) {
  try {
    const { profileId, contentId, contentType } = req.body;
    const userId = req.session.user.id;

    // Validate required fields
    if (!profileId) {
      return res.status(400).json({ 
        success: false, 
        message: "Profile ID is required" 
      });
    }

    if (!contentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Content ID is required" 
      });
    }

    if (!contentType) {
      return res.status(400).json({ 
        success: false, 
        message: "Content type is required" 
      });
    }

    const result = await clearProgressService(
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
}

// Get profile interactions (likes and progress)
async function getProfileInteractions(req, res) {
  try {
    const { profileId } = req.query;
    const userId = req.session.user.id;

    // Validate required fields
    if (!profileId) {
      return res.status(400).json({ 
        success: false, 
        message: "Profile ID is required" 
      });
    }

    const interactions = await getProfileInteractionsService(
      userId,
      profileId
    );

    res.json({ success: true, data: interactions });
  } catch (error) {
    console.error("Error getting interactions:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  saveProgress,
  clearProgress,
  getProfileInteractions
};
