// Content router (/api/content)
// Imports
const { Router } = require("express");
const {
  toggleContentLike,
  searchContent,
  getContent,
  watchContent,
  getRecommendations,
  getGenreContent,
  addContent,
  updateContent,
  deleteContent,
  getOMDBRating,
} = require("../controllers/feedController");
const { upload } = require('../config/upload');
const { requireAuth, requireAdminAuth } = require("../middleware/auth"); // Import authentication middleware

// Declarations
const contentRouter = Router();

// Protected routes - Apply to entire router
contentRouter.use(requireAuth);

// Content routes
contentRouter.get("/", getContent);
contentRouter.get("/recommendations/:userId/:profileId", getRecommendations);
contentRouter.post("/like", toggleContentLike);
contentRouter.post("/watch/:contentId", watchContent);
contentRouter.get("/search", searchContent);
contentRouter.get("/rating", getOMDBRating); // OMDB rating endpoint
contentRouter.get("/:genreName", getGenreContent);

// Add content endpoint (admin only)
// Handle multiple file uploads:
// - thumbnail (single image)
// - movieVideo (single video for movies)
// - season{X}_episode{Y} (dynamic episode videos for TV shows)
contentRouter.post(
  '/add',
  requireAdminAuth,
  upload.any(), // Accept any field names (needed for dynamic episode fields)
  addContent
);

// Update content endpoint (admin only)
contentRouter.put('/:contentId', requireAdminAuth, updateContent);

// Delete content endpoint (admin only)
contentRouter.delete('/:contentId', requireAdminAuth, deleteContent);

module.exports = { contentRouter };
