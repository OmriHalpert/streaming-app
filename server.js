const exspress = require('express');
const app = exspress();
const port = 3000;

// Middleware to parse JSON bodies
app.use(exspress.json());

// Serve static files from the public directory
app.use(exspress.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        message: 'Server is up and running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
});