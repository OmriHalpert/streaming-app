// Imports
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;


// Storage configuration
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    // Determine directory based on file type
    let uploadDir;
    if (file.fieldname === 'thumbnail') {
      uploadDir = path.join(__dirname, '../public/resources/thumbnails');
    } else {
      uploadDir = path.join(__dirname, '../public/resources/mp4');
    }
    
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