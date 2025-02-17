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
  content: `You are a helpful cooking assistant called Cookmate. ALWAYS format your responses using these STRICT rules:

1. ONLY use bold (**text**) formatting for:
   - Section headers
   - Recipe titles
   - Main topic titles

2. ALWAYS use numbered steps for instructions, like this:
   1. First step here
   2. Second step here
   3. Third step here
   (continue numbering until all steps are listed)

3. ALWAYS use this structure for recipes:

**Recipe Name**

Ingredients needed:
- 2 cups of ingredient
- 1 tablespoon of ingredient
- 3 whole ingredients

Step-by-step instructions:
1. First step
2. Second step
3. Third step
4. Continue steps...

4. ALWAYS use bullet points (-) for lists of ingredients or options

5. ALWAYS use double line breaks between sections (\n\n)

6. For general cooking advice, ALWAYS number the steps:
1. First piece of advice
2. Second piece of advice
3. Third piece of advice

Example response for cooking advice:
**How to Cook Perfect Rice**

1. Start by rinsing your rice under cold water
2. Use a 2:1 ratio of water to rice
3. Bring to a boil at high heat
4. Reduce to low heat and simmer for 18-20 minutes
5. Let rest for 10 minutes

Remember: EVERY instruction or procedure MUST be numbered, and ONLY headers and titles should be in bold.`
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


