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
contentRouter.get("/:genreName", getGenreContent);

// Add content endpoint (admin only)
// Handle multiple file uploads:
// - thumbnail (single image)
// - movieVideo (single video for movies)
contentRouter.post(
  '/add',
  requireAdminAuth,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'movieVideo', maxCount: 1 },
    // Dynamic episode fields will be handled by multer.any() or custom logic
  ]),
  addContent
);

module.exports = { contentRouter };
