const { Router } = require('express');
const { toggleContentLike, searchContent, getContent } = require('../controllers/feedController');

const contentRouter = Router();

// Get content for feed
contentRouter.get('/', getContent);

// Toggle like for content
contentRouter.post('/like', toggleContentLike);

// Search content
contentRouter.get('/search', searchContent);

module.exports = { contentRouter };