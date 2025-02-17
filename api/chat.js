const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

router.post('/', async (req, res) => {
  try {
    const messages = req.body.messages || [];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: "system",
            content: `You are a helpful cooking assistant called Cookmate. ALWAYS format your responses using these STRICT rules:

1. ONLY use bold (**text**) formatting for:
   - Section headers
   - Recipe titles
   - Main topic titles

2. ALWAYS use numbered steps for instructions
3. ALWAYS use bullet points (-) for lists of ingredients or options
4. ALWAYS use double line breaks between sections`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      choices: [{
        message: {
          content: response.data.choices[0].message.content
        }
      }]
    });
  } catch (error) {
    console.error('OpenAI API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get AI response',
      details: error.response?.data?.error?.message || error.message
    });
  }
});

module.exports = router; 