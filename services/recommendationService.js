// Imports
const profileInteractionService = require("./profileInteractionService");
const contentModel = require("../models/contentModel");

// Helper functions
// Returns top 3 genres based on likes / watched
async function analyzeGenrePreferences(interactions, allContent) {
  const genreCounts = {};

  // Liked content gets more weight
  if (interactions.likes && Array.isArray(interactions.likes)) {
    interactions.likes.forEach((contentId) => {
      const content = allContent.find((c) => c.id === contentId);
      if (content && content.genre) {
        content.genre.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 2;
        });
      }
    });
  }

  // Watched content gets less weight
  if (interactions.progress && Array.isArray(interactions.progress)) {
    interactions.progress.forEach((progressItem) => {
      const content = allContent.find((c) => c.id === progressItem.contentId);
      if (content && content.genre) {
        content.genre.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });
  }

  // Get top 3 genres
  const sortedGenres = Object.entries(genreCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return sortedGenres;
}

// Get content from favorite genres
function getContentFromTopGenres(content, genrePreferences, interactions) {
  if (genrePreferences.length === 0) {
    // No preferences yet, just return random stuff
    const shuffled = [...content].sort(() => 0.5 - Math.random());
    return shuffled.map((item) => ({
      ...item.toObject(),
      isLiked: interactions
        ? interactions.likes.includes(item.name)
        : false,
    }));
  }

  const topGenres = genrePreferences.map(([genre]) => genre);

  // Only get content from their top genres
  const matchingContent = content.filter((item) =>
    item.genre.some((genre) => topGenres.includes(genre))
  );

  const shuffled = [...matchingContent].sort(() => 0.5 - Math.random());

  return shuffled.map((item) => ({
    ...item.toObject(),
    isLiked: interactions.likes.includes(item.name),
  }));
}

// Main functions
// Get recommendations for a profile
async function getRecommendations(userId, profileId, limit = 10) {
  try {
    // Get user interactions (likes / watched)
    const interactions = await profileInteractionService.getProfileInteractions(
      userId,
      profileId
    );

    // Get all content
    const allContent = await contentModel.getContent();

    // Return top 3 popular genres
    const genrePreferences = await analyzeGenrePreferences(
      interactions,
      allContent
    );

    // Filter out watched content (content in progress array)
    const watchedContentIds = interactions.progress.map((p) => p.contentId);
    const unwatchedContent = allContent.filter(
      (content) => !watchedContentIds.includes(content.id)
    );

    // Fetch unwatched content from top genres
    const recommendedContent = getContentFromTopGenres(
      unwatchedContent,
      genrePreferences,
      interactions
    );

    return recommendedContent.slice(0, limit);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    throw error;
  }
}

module.exports = {
  getRecommendations,
};
