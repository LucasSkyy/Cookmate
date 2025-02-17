const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    // Prepare messages for OpenAI
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Add system message for context
    formattedMessages.unshift({
      role: "system",
      content: "You are Cookmate, an AI cooking assistant. You help users with recipes, cooking techniques, and kitchen advice. Be friendly, helpful, and knowledgeable about cooking. When suggesting recipes, include [RECIPE_ID:123456] format for recipe IDs when available."
    });

    // Make request to OpenAI API
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Send response back to client
    res.json({
      choices: [{
        message: {
          content: response.data.choices[0].message.content
        }
      }]
    });

  } catch (error) {
    console.error('Chat API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: error.response?.data || error.message
    });
  }
});

module.exports = router; 