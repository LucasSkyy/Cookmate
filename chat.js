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

    formatMessage(content) {
      // Handle bold text (both ** and __ syntax)
      content = content.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

      // Handle italics (both * and _ syntax)
      content = content.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

      // Handle numbered lists
      content = content.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
      content = content.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

      // Handle bullet points
      content = content.replace(/^[-*•]\s+(.+)$/gm, '<li>$1</li>');
      content = content.replace(/(?<!<\/ol>)(<li>.*<\/li>)/s, '<ul>$1</ul>');

      // Handle line breaks
      content = content.replace(/\n\n/g, '<br><br>');

      // Handle headings (### for h3, ## for h2, # for h1)
      content = content.replace(/^###\s+(.+)$/gm, '<h3 class="text-xl font-bold my-2">$1</h3>');
      content = content.replace(/^##\s+(.+)$/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>');
      content = content.replace(/^#\s+(.+)$/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>');

      // Handle code blocks or recipe steps
      content = content.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded">$1</code>');

      // Handle horizontal rules
      content = content.replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300">');

      return content;
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
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            messages: this.messageHistory.slice(-10)
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Server Error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch AI response');
        }

        const data = await response.json();
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from server');
        }

        return data.choices[0].message.content;
      } catch (error) {
        console.error('AI Response Error:', error);
        throw new Error('Failed to get AI response. Please try again.');
      }
    }

    displayMessage(message) {
      const chatContainer = document.querySelector('.chat-height');
      const messageDiv = document.createElement('div');
      messageDiv.className = `p-4 rounded-xl mb-4 message-entrance ${message.role === 'user' ? 'bg-white/50 ml-12' : 'bg-orange-100/50 mr-12'
        }`;

      // Format the message content if it's from the assistant
      const formattedContent = message.role === 'assistant'
        ? this.formatMessage(message.content)
        : message.content.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      messageDiv.innerHTML = `
        <span class="mr-2">
          <i class="fas fa-${message.role === 'user' ? 'user' : 'robot'}"></i>
        </span>
        <span class="message-content">${formattedContent}</span>
      `;

      chatContainer.appendChild(messageDiv);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      return messageDiv;
    }
  }

  // Initialize chat only once when the DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.chatInstance) {
      window.chatInstance = new window.ChatAssistant();
    }
  });
}