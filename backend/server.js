require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api', apiRoutes);

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Add this condition for Cloudflare Workers
if (process.env.CLOUDFLARE_WORKER) {
    // Export for Cloudflare Worker
    module.exports = app;
} else {
    // Normal Express server start
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} 