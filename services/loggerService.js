// Imports
const winston = require("winston");
require("winston-mongodb");
require("dotenv").config();

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: "streaming-app", // attached to every log
  },
  transports: [
    // console transport for dev
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // MongoDB transport
    new winston.transports.MongoDB({
      db: process.env.MONGODB_URI,
      collection: "logs",
      options: {
        useUnifiedTopology: true, // Use latest connection management features, avoid connection failures
      },
      metaKey: "metadata", // keeps metadata in the 'metadata' key and not mixed
    }),
  ],
});

// Helper functions for different log categories
const loggerService = {
  // Authentication events
  logAuth: (level, message, metadata = {}) => {
    logger.log(level, message, {
      ...metadata,
      category: "authentication",
    });
  },

  // user action
  logUserAction: (level, message, metadata = {}) => {
    logger.info(level, message, {
      ...metadata,
      category: "user_action",
    });
  },

  // HTTP requests and responses
  logHttp: (level, message, metadata = {}) => {
    logger.log(level, message, {
      ...metadata,
      category: "http",
    });
  },

  // System events
  logSystem: (level, message, metadata = {}) => {
    logger.log(level, message, {
      ...metadata,
      category: "system",
    });
  },

  // Error logging
  logError: (message, error, metadata = {}) => {
    logger.error(message, {
      ...metadata,
      error: error.message,
      stack: error.stack,
      category: "error",
    });
  },

  // Direct access to winston logger
  raw: logger,
};

module.exports = loggerService;
