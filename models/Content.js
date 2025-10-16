// Content related schemas
const mongoose = require("mongoose");

// Content schema
const contentSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 5,
    },
    type: {
      type: String,
      enum: ["movie", "show"],
      required: true
    },
    rating: {
      type: Number,
      min: 0,
      max: 10
    },
    summary: {
      type: String,
      default: ""
    },
    genre: {
      type: [String],
      required: true,
      validate: {
        validator: function (genres) {
          return genres.length > 0;
        },
        message: "At least one genre is required",
      },
    },
    cast: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      wikiUrl: {
        type: String,
        trim: true
      }
    }],
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    thumbnail: {
      type: String,
      required: false, // Made optional since not all content has thumbnails
    },
    durationSec: {
      type: Number,
      min: 0,
      required: function() { // Only if movie
        return this.type === "movie";
      }
    },
    seasons: {
      type: [
        {
          seasonNumber: {
            type: Number,
            required: true,
            min: 1
          },
          episodes: [
            {
              episodeNumber: {
                type: Number,
                required: true,
                min: 1
              },
              title: {
                type: String,
                require: true,
                trim: true
              },
              durationSec: {
                type: Number,
                required: true,
                min: 0
              }
            }
          ]
        }
      ],
      required: function() { // Only if show
        return this.type === "show";
      },
    },
  },
  {
    timestamps: true,
    collection: "content",
  }
);

// Create indexes for better performance
contentSchema.index({ id: 1 }, { unique: true });
contentSchema.index({ genre: 1 });
contentSchema.index({ name: 1, year: 1 }, {unique: true});
contentSchema.index({ likes: -1 }); // Descending for popular content first

// Create and export the model
const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
