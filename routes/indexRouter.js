// API Router (/api)
// Imports
const { Router } = require("express");
const { authRouter } = require("./authRouter.js");
const { usersRouter } = require("./usersRouter.js");
const { contentRouter } = require("./contentRouter.js");
const { profilesRouter } = require("./profilesRouter.js");
const { progressRouter } = require("./progressRouter.js");
const { statsRouter } = require('./statsRouter.js');

// Declarations
const indexRouter = Router();

// Route to handle user authentication
indexRouter.use("/auth", authRouter);

// Route to handle user parameters
indexRouter.use("/users", usersRouter);

// Route to handle content operations
indexRouter.use("/content", contentRouter);

// Route to handle profile operations
indexRouter.use("/profiles", profilesRouter);

// Route to handle progress tracking
indexRouter.use("/progress", progressRouter);

// Route to handle statistics operATIONS
indexRouter.use("/stats", statsRouter);

module.exports = { indexRouter };
