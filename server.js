const express = require("express");
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/chat', require('./api/chat'));

// Route handlers for HTML pages
const pages = {
  '/': 'index.html',
  '/assistant': 'assistant.html',
  '/recipes': 'recipes.html',
  '/blog': 'blog.html',
  '/contact': 'contact.html'
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, file));
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something broke!',
    details: err.message
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


