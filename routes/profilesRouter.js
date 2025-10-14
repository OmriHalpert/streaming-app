// Profiles router (/api/profiles)
// Imports
const { Router } = require("express");
const {
  addProfile,
  updateProfile,
  deleteProfile,
} = require("../controllers/profilesController");
const {
  requireAuthAndOwnership,
  requireProfileOwnership,
} = require("../middleware/auth"); // Import authentication middleware

// Declarations
const profilesRouter = Router();

// Profile operations - Require user ownership
profilesRouter.post("/add", requireAuthAndOwnership, addProfile);
profilesRouter.put("/update", requireProfileOwnership, updateProfile);
profilesRouter.delete("/delete", requireProfileOwnership, deleteProfile);

module.exports = { profilesRouter };
