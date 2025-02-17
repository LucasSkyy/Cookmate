const express = require("express");
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware with security headers
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files with caching headers
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// API routes
app.use('/api/chat', require('./api/chat'));

// Route handlers for HTML pages with error handling
const pages = {
  '/': 'index.html',
  '/assistant': 'assistant.html',
  '/recipes': 'recipes.html',
  '/blog': 'blog.html',
  '/contact': 'contact.html'
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res, next) => {
    res.sendFile(path.join(__dirname, 'public', file), err => {
      if (err) next(err);
    });
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    error: 'Server error',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


