const { Router } = require('express');
const { getUsers, getUserById, getUserProfiles } = require('../controllers/userController');

const usersRouter = Router();

// Route to get users array
usersRouter.get('/', getUsers); 

// Route to get specific user data fetch
usersRouter.get('/:id', getUserById);

// Route to get specufuc user profiles
usersRouter.get('/:id/profiles', getUserProfiles);

module.exports = { usersRouter };