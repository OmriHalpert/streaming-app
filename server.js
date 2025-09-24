// Imports
const express = require('express');
const { indexRouter } = require('./routes/indexRouter.js');
const { pagesRouter } = require('./routes/pagesRouter.js');

// Variables
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Set view engine
app.set('view engine', 'ejs');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: 'Server is up and running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Page routes (EJS templates)
app.use('/', pagesRouter);

// API routes (JSON responses)
app.use('/api', indexRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
});