const { Router } = require('express');
const { getUserById, getUserProfiles } = require('../controllers/userController');

// Import authentication middleware
const { requireAuthAndOwnership } = require('../middleware/auth');

const usersRouter = Router();

// 🔒 PROTECTED ROUTES - Require authentication AND ownership
usersRouter.get('/:id', requireAuthAndOwnership, getUserById);
usersRouter.get('/:id/profiles', requireAuthAndOwnership, getUserProfiles);

module.exports = { usersRouter };