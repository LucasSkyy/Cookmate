// Only define ChatAssistant if it doesn't exist
if (typeof window.ChatAssistant === 'undefined') {
  window.ChatAssistant = class {
    constructor() {
      this.apiEndpoint = 'http://localhost:3000/api/chat';
      this.messageHistory = [{
        role: 'assistant',
        content: "Hi there! I'm your Cookmate AI. What would you like to cook today? 🍳"
      }];
      this.init();
    }

    init() {
      const chatContainer = document.querySelector('.chat-height');
      const userInput = document.getElementById('userInput');
      const sendButton = document.getElementById('sendButton');

      // Display initial message
      this.displayMessage(this.messageHistory[0]);

      sendButton.addEventListener('click', () => this.handleSend(userInput, chatContainer));
      userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.handleSend(userInput, chatContainer);
        }
      });
    }

    async handleSend(userInput, chatContainer) {
      const message = userInput.value.trim();
      if (message === '') return;

      // Clear input
      userInput.value = '';

      try {
        // Display user message
        const userMessage = { role: 'user', content: message };
        this.displayMessage(userMessage);
        this.messageHistory.push(userMessage);

        // Show loading indicator
        const loadingMessage = { role: 'assistant', content: '...' };
        const loadingElement = this.displayMessage(loadingMessage);

        // Get AI response
        const aiResponse = await this.getAIResponse(message);

        // Remove loading indicator
        loadingElement.remove();

        // Display AI response
        const aiMessage = { role: 'assistant', content: aiResponse };
        this.displayMessage(aiMessage);
        this.messageHistory.push(aiMessage);

        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
      } catch (error) {
        console.error('Error:', error);
        this.displayMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        });
      }
    }

    async getAIResponse(message) {
      try {
        const response = await fetch(this.apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messages: this.messageHistory
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server Error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch AI response');
        }

        const data = await response.json();
        return data.choices[0].message.content;
      } catch (error) {
        console.error('AI Response Error:', error);
        throw error;
      }
    }

    displayMessage(message) {
      const chatContainer = document.querySelector('.chat-height');
      const messageDiv = document.createElement('div');
      messageDiv.className = `p-4 rounded-xl mb-4 ${message.role === 'user'
        ? 'bg-white/50 ml-12'
        : 'bg-orange-100/50 mr-12'
        }`;

      const iconSpan = document.createElement('span');
      iconSpan.className = 'mr-2';
      iconSpan.innerHTML = message.role === 'user'
        ? '<i class="fas fa-user"></i>'
        : '<i class="fas fa-robot"></i>';

      const textSpan = document.createElement('span');
      textSpan.textContent = message.content;

      messageDiv.appendChild(iconSpan);
      messageDiv.appendChild(textSpan);
      chatContainer.appendChild(messageDiv);

      return messageDiv; // Return the element for potential removal (loading indicator)
    }
  }

  // Initialize chat only once when the DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.chatInstance) {
      window.chatInstance = new window.ChatAssistant();
    }
  });
}