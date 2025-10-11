const { Router } = require('express');
const { getUsers, getUserById, getUserProfiles } = require('../controllers/userController');

// Import authentication middleware
const { requireAuth, requireAuthAndOwnership } = require('../middleware/auth');

const usersRouter = Router();

// 🔓 PUBLIC ROUTE - No authentication needed (maybe for admin panel later)
usersRouter.get('/', getUsers); 

// 🔒 PROTECTED ROUTES - Require authentication AND ownership
usersRouter.get('/:id', requireAuthAndOwnership, getUserById);
usersRouter.get('/:id/profiles', requireAuthAndOwnership, getUserProfiles);

module.exports = { usersRouter };