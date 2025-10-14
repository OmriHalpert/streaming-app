const mongoose = require("mongoose");

// Database connection function
async function connectToDatabase() {
  try {
    // Connection options for better performance and reliability
    const options = {
      // Connection management
      maxPoolSize: 10, // Maximum number of connections in the pool
      serverSelectionTimeoutMS: 5000, // How long to try selecting a server
      socketTimeoutMS: 45000, // How long a send or receive on a socket can take
      bufferCommands: false, // Disable mongoose buffering
    };

    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI, options);

    console.log("Successfully connected to MongoDB Atlas");
    console.log(`Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    // Exit process with failure code
    process.exit(1);
  }
}

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB Atlas");
});

mongoose.connection.on("error", (error) => {
  console.error("Mongoose connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB Atlas");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
});

module.exports = { connectToDatabase };
