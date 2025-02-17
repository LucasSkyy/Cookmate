require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require('axios');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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

const systemMessage = {
  role: "system",
  content: `You are a helpful cooking assistant called Cookmate. You help users with recipes, cooking techniques, and culinary advice. Be friendly and concise.

Format your responses using these markdown-style conventions:
- Use **bold** for important terms, ingredients, and measurements
- Use # for main titles, ## for subtitles, and ### for section headers
- Use numbered lists (1. 2. 3.) for steps in recipes or procedures
- Use bullet points (-) for ingredients or general lists
- Use \`code\` for specific temperatures, times, or measurements
- Use line breaks between sections for clarity
- Start recipe names with ##
- Use --- for separating major sections`
};

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OpenAI API key is not configured" });
  }

  try {
    const messages = req.body.messages || [];

    // Ensure messages is an array and has content
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages must be an array" });
    }

    // Add system message for context
    const conversationMessages = [
      systemMessage,
      ...messages
    ];

    const openAIResponse = await axios.post(
      OPENAI_API_URL,
      {
        model: "gpt-3.5-turbo",
        messages: conversationMessages,
        temperature: 0.7,
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 second timeout
      }
    );

    // Check if we have a valid response
    if (!openAIResponse.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from OpenAI');
    }

    // Send the response back to the client
    return res.json({
      choices: [{
        message: {
          content: openAIResponse.data.choices[0].message.content
        }
      }]
    });

  } catch (error) {
    console.error("OpenAI API Error:", error);

    // Log detailed error information
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }

    // Send a more specific error message
    return res.status(500).json({
      error: "Failed to get AI response",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


