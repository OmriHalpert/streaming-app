// Authentication router (/api/auth)
// Imports
const { Router } = require("express");
const { register, login } = require("../controllers/authController.js");

// Declarations
const authRouter = Router();

// Route to handle user registration
authRouter.post("/register", register);

// Route to handle user login
authRouter.post("/login", login);

module.exports = { authRouter };
