const { Router } = require('express');
const { authRouter } = require('./authRouter.js');
const { usersRouter } = require('./usersRouter.js');

const indexRouter = Router();

// Route to handle user authentication
indexRouter.use('/auth', authRouter);

// Route to handle user parameters
indexRouter.use('/users', usersRouter);

module.exports = { indexRouter };
