// Imports
const Content = require("../models/Content");
const profileInteractionService = require("../services/profileInteractionService");

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
    const content = await Content.findOne({ id: parseInt(contentId) });

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

    // Convert mongoose document to plain object for easier use in template
    const contentData = content.toObject();

    // Render content details page with all data
    res.render("content-details", {
      content: contentData,
      userId,
      profileId,
      isLiked,
      isWatched,
      watchProgress,
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
