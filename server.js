// Imports
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");

// Middleware
const { logAuthEvents, logErrors } = require("./middleware/loggerMiddleware");
const { logSystem } = require("./services/loggerService.js");
const { addUserToLocals } = require("./middleware/auth");

// DB
const { connectToDatabase } = require("./config/database");

// Routers
const { indexRouter } = require("./routes/indexRouter.js");
const { pagesRouter } = require("./routes/pagesRouter.js");

// Variables
const app = express();
const port = process.env.PORT || 3000;

// Initialize database connection
async function startServer() {
  try {
    // Connect to MongoDB Atlas
    await connectToDatabase();
    logSystem("info", "Database connection established");

    // Middleware to parse JSON bodies
    app.use(express.json());

    // Session middleware
    app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
          mongoUrl: process.env.MONGODB_URI,
          collectionName: "sessions",
        }),
        cookie: {
          secure: false,
          httpOnly: true, // Prevent XSS
          maxAge: 1000 * 60 * 60 * 24,
        },
      })
    );

    // Logging middleware
    app.use(logAuthEvents); // Log authentication events

    // Add user info to all templates
    app.use(addUserToLocals);

    // Serve static files from the public directory
    app.use(express.static("public"));

    // Set view engine
    app.set("view engine", "ejs");

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({
        status: "healthy",
        message: "Server is up and running",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database:
          mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      });
    });

    // Page routes (EJS templates)
    app.use("/", pagesRouter);

    // API routes (JSON responses)
    app.use("/api", indexRouter);

    // Error logging middleware
    app.use(logErrors);

    // Start the server
    app.listen(port, () => {
      const message = `Server is running on http://localhost:${port}`;
      console.log(message);
      console.log(`Health check available at http://localhost:${port}/health`);

      // Log successful server start
      logSystem("info", "Server started successfully", {
        port: port,
        environment: process.env.NODE_ENV || "development",
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);

    // Log server startup failure
    logSystem("error", "Server startup failed", {
      error: error.message,
      stack: error.stack,
    });

    process.exit(1);
  }
}

// Start the application
startServer();
