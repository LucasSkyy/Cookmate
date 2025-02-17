const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      console.log('Invalid messages format:', messages); // Debug log
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    console.log('Sending messages to OpenAI:', messages); // Debug log

    const formattedMessages = [
      {
        role: "system",
        content: "You are Cookmate AI, a helpful cooking assistant. Format your responses with bold titles using '**' (e.g., '**Ingredients:**'). When providing recipes or instructions, use clear sections like:\n\n**Recipe Name:**\n**Ingredients:**\n**Instructions:**\n**Tips:**\n\nUse bullet points or numbered lists for steps and ingredients. Keep responses practical and engaging."
      },
      ...messages
    ];

    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing!');
      return res.status(500).json({ error: 'API configuration error' });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo",
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('OpenAI Response:', response.data); // Debug log

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    res.json({
      choices: [{
        message: {
          content: response.data.choices[0].message.content
        }
      }]
    });

  } catch (error) {
    console.error('Chat API Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: 'Failed to get AI response',
      details: error.message
    });
  }
});

module.exports = router; 