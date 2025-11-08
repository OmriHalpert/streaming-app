// Users router (/api/users)
// Imports
const { Router } = require("express");
const {
  getUserById,
  getUserProfiles,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const { requireAuthAndOwnership, requireAdminAuth } = require("../middleware/auth"); // Import authentication middleware

// Declarations
const usersRouter = Router();

// Protected routes - Require authentication AND ownership
usersRouter.get("/:id", requireAuthAndOwnership, getUserById);
usersRouter.get("/:id/profiles", requireAuthAndOwnership, getUserProfiles);

// Admin only routes
usersRouter.put("/:id", requireAdminAuth, updateUser);
usersRouter.delete("/:id", requireAdminAuth, deleteUser);

module.exports = { usersRouter };
