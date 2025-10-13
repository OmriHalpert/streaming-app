const mongoose = require('mongoose');

// Content schema
const contentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 5
    },
    genre: {
        type: [String],
        required: true,
        validate: {
            validator: function(genres) {
                return genres.length > 0;
            },
            message: 'At least one genre is required'
        }
    },
    likes: {
        type: Number,
        default: 0,
        min: 0
    },
    profileLikes: {
        type: [Number],
        default: []
    },
    profileWatched: {
        type: [Number],
        default: []
    },
    thumbnail: {
        type: String,
        required: false  // Made optional since not all content has thumbnails
    }
}, {
    timestamps: true,
    collection: 'content'
});

// Create indexes for better performance
contentSchema.index({ genre: 1 });
contentSchema.index({ year: 1 });
contentSchema.index({ likes: -1 }); // Descending for popular content first

// Create and export the model
const Content = mongoose.model('Content', contentSchema);

module.exports = Content;