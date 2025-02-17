// Only define ChatAssistant if it doesn't exist
if (typeof window.ChatAssistant === 'undefined') {
  window.ChatAssistant = class {
    constructor() {
      console.log('Initializing ChatAssistant...'); // Debug log
      this.apiEndpoint = '/api/chat';
      this.messageHistory = [];
      this.init();
    }

    init() {
      console.log('Running init...'); // Debug log
      const chatContainer = document.querySelector('.chat-height');
      const userInput = document.getElementById('userInput');
      const sendButton = document.getElementById('sendButton');

      if (!chatContainer || !userInput || !sendButton) {
        console.error('Required elements not found!');
        return;
      }

      // Clear existing messages
      chatContainer.innerHTML = '';

      // Add initial greeting
      const initialMessage = {
        role: 'assistant',
        content: "👋 Hi! I'm your Cookmate AI assistant. I can help you with recipes, cooking techniques, and kitchen tips. What would you like to cook today? 🍳"
      };
      this.messageHistory.push(initialMessage);
      this.displayMessage(initialMessage);

      // Event listeners
      sendButton.addEventListener('click', () => {
        const message = userInput.value.trim();
        if (message) {
          this.handleSend(userInput, chatContainer);
        }
      });

      userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && userInput.value.trim()) {
          this.handleSend(userInput, chatContainer);
        }
      });

      // Focus input
      userInput.focus();
    }

    async handleSend(userInput, chatContainer) {
      const message = userInput.value.trim();
      if (!message) return;

      // Clear input and disable
      userInput.value = '';
      userInput.disabled = true;

      try {
        // Show user message
        const userMessage = { role: 'user', content: message };
        this.messageHistory.push(userMessage);
        this.displayMessage(userMessage);

        // Show typing indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'p-4 rounded-xl mb-4 bg-orange-100/50 mr-12';
        loadingDiv.innerHTML = '<div class="flex items-start"><span class="mr-2"><i class="fas fa-robot"></i></span>Thinking...</div>';
        chatContainer.appendChild(loadingDiv);

        // Get AI response
        const aiResponse = await this.getAIResponse();

        // Remove typing indicator
        loadingDiv.remove();

        // Show AI response
        const aiMessage = { role: 'assistant', content: aiResponse };
        this.messageHistory.push(aiMessage);
        this.displayMessage(aiMessage);

      } catch (error) {
        console.error('Error:', error);
        this.displayMessage({
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        });
      } finally {
        userInput.disabled = false;
        userInput.focus();
      }
    }

    async getAIResponse() {
      console.log('Sending messages:', this.messageHistory); // Debug log
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
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const data = await response.json();
      console.log('AI Response:', data); // Debug log

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from server');
      }

      return data.choices[0].message.content;
    }

    displayMessage(message) {
      const chatContainer = document.querySelector('.chat-height');
      if (!chatContainer) return;

      const messageDiv = document.createElement('div');
      messageDiv.className = `p-4 rounded-xl mb-4 message-entrance ${message.role === 'user' ? 'bg-white/50 ml-12' : 'bg-orange-100/50 mr-12'
        }`;

      const formattedContent = this.formatMessage(message.content);

      messageDiv.innerHTML = `
        <div class="flex items-start">
          <span class="mr-2 mt-1">
            <i class="fas fa-${message.role === 'user' ? 'user' : 'robot'}"></i>
          </span>
          <div class="message-content flex-1">${formattedContent}</div>
        </div>
      `;

      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    formatMessage(content) {
      // Handle titles (text followed by colon at start of line)
      content = content.replace(/^(.+):(\s*)/gm, '<strong class="text-lg">$1:</strong>$2');

      // Apply markdown-style formatting
      content = content
        // Bold text
        .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
        // Italic text
        .replace(/(\*|_)(.*?)\1/g, '<em>$2</em>')
        // Bullet points and numbered lists
        .replace(/^[-•]\s+(.+)$/gm, '<li>$1</li>')
        .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>')
        // Wrap consecutive list items
        .replace(/(<li>.*<\/li>)\s*(<li>.*<\/li>)/gs, '<ul>$1$2</ul>')
        // Line breaks
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>')
        // Code blocks
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>')
        // Horizontal rules
        .replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300">');

      // Remove recipe ID tags
      content = content.replace(/\[RECIPE_ID:\d+\]/g, '');

      return content;
    }
  };

  // Initialize chat when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOM loaded, creating chat instance...'); // Debug log
      window.chatInstance = new ChatAssistant();
    });
  } else {
    console.log('DOM already loaded, creating chat instance...'); // Debug log
    window.chatInstance = new ChatAssistant();
  }
} 