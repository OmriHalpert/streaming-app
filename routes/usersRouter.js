const { Router } = require('express');
const { getUsers, getUserById } = require('../controllers/userController');

const usersRouter = Router();

// Route to get users array
usersRouter.get('/', getUsers); 

// Route to get specific user data fetch
usersRouter.get('/:id', getUserById);

module.exports = { usersRouter };