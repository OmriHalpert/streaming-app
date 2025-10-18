// User related schemas
const mongoose = require("mongoose");

// Profile subdocument schema
const profileSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    avatar: {
      type: String,
      required: true,
    },
  },
  { _id: false }
); // Disable automatic _id for subdocuments

// User main schema
const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    profiles: {
      type: [profileSchema],
      default: [],
      validate: {
        validator: function (profiles) {
          return profiles.length <= 5;
        },
        message: "Maximum 5 profiles allowed per user",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    collection: "users", // Explicitly set collection name
  }
);

// Create and export the model
const User = mongoose.model("User", userSchema);

module.exports = User;
