// Imports
const profileInteractionService = require("../services/profileInteractionService");
const { getContentById, checkIfCompleted } = require("../services/contentService");

// Main functions
// Render content details page
async function renderContentDetailsPage(req, res) {
  try {
    // Get contentId from URL params and userId/profileId from query
    const { contentId } = req.params;
    const { userId, profileId } = req.query;

    // Validate required parameters
    if (!contentId) {
      return res.status(400).render("error", {
        message: "Content ID is required",
      });
    }

    if (!userId || !profileId) {
      return res.status(400).render("error", {
        message: "User ID and Profile ID are required to access content details",
      });
    }

    // Fetch content by ID from database
    const content = await getContentById(parseInt(contentId));

    if (!content) {
      return res.status(404).render("error", {
        message: "Content not found",
      });
    }

    // Get user's profile interactions (likes and progress)
    const interactions = await profileInteractionService.getProfileInteractions(
      parseInt(userId),
      parseInt(profileId)
    );

    // Check if user has liked this content
    const isLiked = interactions.likes.includes(content.id);

    // Check if user has watched/started this content
    const progressItem = interactions.progress.find(
      (p) => p.contentId === content.id
    );
    const isWatched = !!progressItem;
    const watchProgress = progressItem || null;

    // Check if user has completed the content
    const isContentCompleted = await checkIfCompleted(parseInt(contentId), parseInt(userId), parseInt(profileId));

    // Convert mongoose document to plain object for easier use in template
    const contentData = content.toObject();

    // Format duration for movies (convert seconds to human-readable format)
    if (contentData.type === 'movie' && contentData.durationSec) {
      const minutes = Math.floor(contentData.durationSec / 60);
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      
      if (hours > 0) {
        contentData.duration = `${hours}h ${remainingMinutes}m`;
      } else {
        contentData.duration = `${minutes}m`;
      }
    }

    // Render content details page with all data
    res.render("content-details", {
      content: contentData,
      userId,
      profileId,
      isLiked,
      isWatched,
      watchProgress,
      isContentCompleted,
    });
  } catch (error) {
    console.error("Error rendering content details page:", error);
    res.status(500).render("error", {
      message: "Unable to load content details. Please try again.",
    });
  }
}

module.exports = {
  renderContentDetailsPage,
};
