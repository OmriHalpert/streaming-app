// Imports
const { Router } = require("express");
const { 
  saveProgress, 
  clearProgress, 
  getProfileInteractions 
} = require("../controllers/progressController");
const { requireAuth } = require("../middleware/auth");

// Declarations
const progressRouter = Router();

// Progress operations - Require authentication
progressRouter.post("/save", requireAuth, saveProgress);
progressRouter.delete("/clear", requireAuth, clearProgress);
progressRouter.get("/interactions", requireAuth, getProfileInteractions);

module.exports = { progressRouter };
