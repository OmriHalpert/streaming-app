# Backend Implementation Plan for Add Content Feature

## Overview
This plan outlines the steps to implement the backend API for adding new content (movies and TV shows) to your streaming app.

---

## Phase 1: File Upload Setup

### 1.1 Install Required Packages
```bash
npm install multer ffmpeg-static fluent-ffmpeg
```

- **multer**: Handle multipart/form-data for file uploads
- **ffmpeg-static**: Static FFmpeg binary for video processing
- **fluent-ffmpeg**: Node.js wrapper for FFmpeg (to extract video metadata)

### 1.2 Create Upload Configuration (`config/upload.js`)
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Storage configuration
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/resources/mp4');
    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: contentName_timestamp_originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter - only accept mp4 and images
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    // Accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnail'), false);
    }
  } else {
    // Accept only mp4 videos
    if (file.mimetype === 'video/mp4') {
      cb(null, true);
    } else {
      cb(new Error('Only MP4 video files are allowed'), false);
    }
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  }
});

module.exports = { upload };
```

### 1.3 Create Video Processing Utility (`utils/videoProcessor.js`)
```javascript
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegPath);

// Get video duration in seconds
function getVideoDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      const duration = Math.round(metadata.format.duration);
      resolve(duration);
    });
  });
}

module.exports = { getVideoDuration };
```

---

## Phase 2: Content Model Updates

### 2.1 Verify Content Schema (`models/Content.js`)
Your schema looks good! Ensure these fields exist:
- ✅ `id` (Number, unique, auto-increment)
- ✅ `name` (String, required, unique)
- ✅ `year` (Number, required)
- ✅ `type` (String, enum: ['movie', 'show'])
- ✅ `genre` (Array of Strings)
- ✅ `cast` (Array with `name` and `wikiUrl`)
- ✅ `director` (String, required)
- ✅ `summary` (String)
- ✅ `thumbnail` (String, required: false)
- ✅ `durationSec` (Number, required for movies)
- ✅ `videoUrl` (String) - ADD THIS if missing!
- ✅ `seasons` (Array, required for shows)

### 2.2 Add Missing Field (if needed)
Add `videoUrl` field to Content schema:
```javascript
videoUrl: {
  type: String,
  required: function() {
    return this.type === 'movie';
  }
}
```

Also add `videoUrl` to episode schema:
```javascript
episodes: [{
  episodeNumber: Number,
  title: String,
  durationSec: Number,
  videoUrl: String  // Add this
}]
```

---

## Phase 3: Content Service

### 3.1 Create `services/contentService.js` (Add New Functions)

Add these functions to your existing `contentService.js`:

```javascript
// Get next available content ID
async function getNextContentId() {
  const lastContent = await contentModel.getContent();
  if (!lastContent || lastContent.length === 0) {
    return 1;
  }
  const maxId = Math.max(...lastContent.map(c => c.id));
  return maxId + 1;
}

// Add new content
async function addNewContent(contentData) {
  try {
    // Validate required fields
    if (!contentData.name || !contentData.year || !contentData.type || 
        !contentData.genre || !contentData.director) {
      throw new Error('Missing required fields');
    }

    // Get next ID
    const nextId = await getNextContentId();

    // Prepare content object
    const newContent = {
      id: nextId,
      name: contentData.name,
      year: contentData.year,
      type: contentData.type,
      genre: contentData.genre,
      cast: contentData.cast || [],
      director: contentData.director,
      summary: contentData.summary || '',
      thumbnail: contentData.thumbnail || null,
      rating: 5.0, // Default rating
      likes: 0
    };

    // Add type-specific fields
    if (contentData.type === 'movie') {
      newContent.durationSec = contentData.durationSec;
      newContent.videoUrl = contentData.videoUrl;
    } else {
      newContent.seasons = contentData.seasons;
    }

    // Save to database
    const savedContent = await contentModel.addContent(newContent);

    return savedContent;
  } catch (error) {
    throw error;
  }
}

// Export new functions
module.exports = {
  // ... existing exports
  getNextContentId,
  addNewContent
};
```

---

## Phase 4: Content Model Functions

### 4.1 Add to `models/contentModel.js`

```javascript
const Content = require('./Content');

// Add new content
async function addContent(contentData) {
  try {
    const newContent = new Content(contentData);
    await newContent.save();
    return newContent;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  // ... existing exports
  addContent
};
```

---

## Phase 5: Content Controller

### 5.1 Create `controllers/contentController.js` (or add to existing)

```javascript
const contentService = require('../services/contentService');
const { getVideoDuration } = require('../utils/videoProcessor');
const path = require('path');

// Add new content
async function addContent(req, res) {
  try {
    // Extract form data
    const {
      name,
      year,
      type,
      genres,
      cast,
      director,
      summary
    } = req.body;

    // Parse genres (comma-separated string to array)
    const genreArray = genres.split(',').map(g => g.trim());

    // Parse cast (JSON string to array)
    const castArray = JSON.parse(cast);

    // Prepare content data
    const contentData = {
      name,
      year: parseInt(year),
      type,
      genre: genreArray,
      cast: castArray,
      director,
      summary
    };

    // Handle thumbnail
    if (req.files && req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      contentData.thumbnail = `/resources/thumbnails/${thumbnailFile.filename}`;
    }

    // Handle movie or show
    if (type === 'movie') {
      // Movie: single video
      if (!req.files || !req.files.movieVideo) {
        return res.status(400).json({
          success: false,
          error: 'Movie video is required'
        });
      }

      const videoFile = req.files.movieVideo[0];
      const videoPath = path.join(__dirname, '../public/resources/mp4', videoFile.filename);

      // Extract duration from video
      const duration = await getVideoDuration(videoPath);

      contentData.durationSec = duration;
      contentData.videoUrl = `/resources/mp4/${videoFile.filename}`;

    } else {
      // TV Show: parse seasons
      const seasonsData = JSON.parse(req.body.seasonsData);
      const seasons = [];

      for (const season of seasonsData) {
        const episodes = [];

        for (const episode of season.episodes) {
          // Find corresponding video file
          const videoFieldName = `season${season.seasonNumber}_episode${episode.episodeNumber}`;
          const videoFile = req.files[videoFieldName] ? req.files[videoFieldName][0] : null;

          if (!videoFile) {
            return res.status(400).json({
              success: false,
              error: `Video missing for Season ${season.seasonNumber} Episode ${episode.episodeNumber}`
            });
          }

          const videoPath = path.join(__dirname, '../public/resources/mp4', videoFile.filename);
          const duration = await getVideoDuration(videoPath);

          episodes.push({
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            durationSec: duration,
            videoUrl: `/resources/mp4/${videoFile.filename}`
          });
        }

        seasons.push({
          seasonNumber: season.seasonNumber,
          episodes
        });
      }

      contentData.seasons = seasons;
    }

    // Save content
    const newContent = await contentService.addNewContent(contentData);

    return res.status(201).json({
      success: true,
      message: 'Content added successfully',
      data: newContent
    });

  } catch (error) {
    console.error('Error adding content:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add content'
    });
  }
}

module.exports = {
  addContent
};
```

---

## Phase 6: Content Router

### 6.1 Create or Update `routes/contentRouter.js`

```javascript
const { Router } = require('express');
const { upload } = require('../config/upload');
const { addContent } = require('../controllers/contentController');
const { requireAdminAuth } = require('../middleware/auth');

const contentRouter = Router();

// Add content endpoint (admin only)
// Handle multiple file uploads:
// - thumbnail (single image)
// - movieVideo (single video for movies)
// - season1_episode1, season1_episode2, etc. (multiple videos for shows)
contentRouter.post(
  '/add',
  requireAdminAuth,
  upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'movieVideo', maxCount: 1 },
    // Dynamic episode fields will be handled by multer.any() or custom logic
  ]),
  addContent
);

module.exports = { contentRouter };
```

### 6.2 Register Router in `routes/indexRouter.js`
Add this line if not already there:
```javascript
const { contentRouter } = require('./contentRouter');
indexRouter.use('/content', contentRouter);
```

---

## Phase 7: Frontend API Integration

### 7.1 Update `public/js/add-content.js`

Replace the TODO section with actual API call:

```javascript
// Prepare FormData for file upload
const formData = new FormData();

// Add basic fields
formData.append('name', contentData.name);
formData.append('year', contentData.year);
formData.append('type', contentData.type);
formData.append('genres', contentData.genre.join(','));
formData.append('cast', JSON.stringify(contentData.cast));
formData.append('director', contentData.director);
formData.append('summary', contentData.summary);

// Add thumbnail if exists
const thumbnailFile = document.getElementById('thumbnail').files[0];
if (thumbnailFile) {
  formData.append('thumbnail', thumbnailFile);
}

if (contentType === 'movie') {
  // Add movie video
  const movieVideo = document.getElementById('movieVideo').files[0];
  formData.append('movieVideo', movieVideo);
} else {
  // Add seasons data and episode videos
  formData.append('seasonsData', JSON.stringify(contentData.seasons));

  // Add each episode video
  const seasonCards = document.querySelectorAll('.season-card');
  seasonCards.forEach((seasonCard, seasonIndex) => {
    const seasonNumber = seasonIndex + 1;
    const episodeItems = seasonCard.querySelectorAll('.episode-item');

    episodeItems.forEach((episodeItem, episodeIndex) => {
      const episodeNumber = episodeIndex + 1;
      const video = episodeItem.querySelector('.episode-video').files[0];
      const fieldName = `season${seasonNumber}_episode${episodeNumber}`;
      formData.append(fieldName, video);
    });
  });
}

// Send to backend
showMessage('Uploading content...', 'success');
const response = await fetch('/api/content/add', {
  method: 'POST',
  body: formData
});

const result = await response.json();

if (result.success) {
  showMessage('Content added successfully!', 'success');
  // Reset form or redirect
  setTimeout(() => {
    window.location.reload();
  }, 2000);
} else {
  showMessage(result.error || 'Failed to add content', 'error');
}
```

---

## Phase 8: Testing Checklist

### Test Movie Upload:
- [ ] Fill all fields (name, year, genres, cast, director, summary)
- [ ] Upload thumbnail image
- [ ] Upload movie video (MP4)
- [ ] Submit form
- [ ] Verify content appears in database
- [ ] Verify video and thumbnail are saved in `/public/resources/`
- [ ] Verify duration is correctly extracted

### Test TV Show Upload:
- [ ] Fill all fields
- [ ] Add 2 seasons with 3 episodes each
- [ ] Upload videos for each episode
- [ ] Submit form
- [ ] Verify all episodes are saved
- [ ] Verify all video files are saved
- [ ] Verify durations for all episodes

---

## Phase 9: Error Handling & Validation

### Add to controller:
- Check for duplicate content names
- Validate file sizes
- Validate video formats
- Handle upload failures
- Clean up files on error
- Add transaction support (if needed)

---

## Summary of Files to Create/Modify:

**Create New:**
1. `config/upload.js` - Multer configuration
2. `utils/videoProcessor.js` - FFmpeg utilities

**Modify Existing:**
3. `models/Content.js` - Add videoUrl field (if missing)
4. `models/contentModel.js` - Add addContent function
5. `services/contentService.js` - Add getNextContentId, addNewContent
6. `controllers/contentController.js` - Add addContent function
7. `routes/contentRouter.js` - Add POST /add route
8. `routes/indexRouter.js` - Register content router
9. `public/js/add-content.js` - Replace TODO with FormData upload

---

## Next Steps Priority:

1. ✅ Install packages (multer, ffmpeg-static, fluent-ffmpeg)
2. ✅ Create upload.js and videoProcessor.js
3. ✅ Update Content schema
4. ✅ Add model functions
5. ✅ Add service functions
6. ✅ Create controller
7. ✅ Setup routes
8. ✅ Update frontend JS
9. ✅ Test with small video files first!

Good luck! Let me know which phase you're working on if you need help! 🚀
