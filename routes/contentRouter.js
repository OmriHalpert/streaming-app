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
} = require("../controllers/feedController");
const { requireAuth } = require("../middleware/auth"); // Import authentication middleware

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

module.exports = { contentRouter };
