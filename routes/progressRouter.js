// Progress router (/api/progress)
// Imports
const { Router } = require("express");
const { 
  saveProgress, 
  clearProgress, 
  getProfileInteractions 
} = require("../controllers/progressController");
const { requireAuth, requireProfileOwnership } = require("../middleware/auth");

// Declarations
const progressRouter = Router();

// Progress operations - Require authentication and profile ownership
progressRouter.post("/save", requireProfileOwnership, saveProgress);
progressRouter.delete("/clear", requireProfileOwnership, clearProgress);
progressRouter.get("/interactions", requireProfileOwnership, getProfileInteractions);

module.exports = { progressRouter };
