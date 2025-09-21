const { Router } = require('express');
const { authRouter } = require('./authRouter.js');

const indexRouter = Router();

// Route to handle user authentication
indexRouter.use('/auth', authRouter);

module.exports = { indexRouter };
