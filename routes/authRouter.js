const { Router } = require('express');
const { register } = require('../controllers/authController.js');

const authRouter = Router();

// Route to handle user registration
authRouter.post('/register', register);

// Route to handle user login
// authRouter.post('/login', login);

module.exports = { authRouter };

// Note: Ensure that the authController has methods 'register' and 'login' defined.
// This router can be mounted in the main server file (e.g., server.js) using:
// app.use('/auth', authRouter);