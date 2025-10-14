// Users router (/api/users)
// Imports
const { Router } = require("express");
const {
  getUserById,
  getUserProfiles,
} = require("../controllers/userController");
const { requireAuthAndOwnership } = require("../middleware/auth"); // Import authentication middleware

// Declarations
const usersRouter = Router();

// Protected routes - Require authentication AND ownership
usersRouter.get("/:id", requireAuthAndOwnership, getUserById);
usersRouter.get("/:id/profiles", requireAuthAndOwnership, getUserProfiles);

module.exports = { usersRouter };
