// Imports
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { connectToDatabase } = require("./config/database");
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
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
        },
      })
    );

    // Import middleware
    const { addUserToLocals } = require('./middleware/auth');
    
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

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
      console.log(`Health check available at http://localhost:${port}/health`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the application
startServer();
