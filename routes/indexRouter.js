const { Router } = require('express');
const { authRouter } = require('./authRouter.js');
const { usersRouter } = require('./usersRouter.js');
const { contentRouter } = require('./contentRouter.js');

const indexRouter = Router();

// Route to handle user authentication
indexRouter.use('/auth', authRouter);

// Route to handle user parameters
indexRouter.use('/users', usersRouter);

// Route to handle content operations
indexRouter.use('/content', contentRouter);

module.exports = { indexRouter };
