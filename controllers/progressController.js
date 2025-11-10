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
    const userId = req.session.user.id; // Get from session, not client

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
    const userId = req.session.user.id; // Get from session, not client

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
    const userId = req.session.user.id; // Get from session, not client

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
