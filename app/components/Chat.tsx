'use client'

import { useState, useEffect } from 'react';
import { chatStorage } from '../utils/chatStorage';

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load chat history on component mount
  useEffect(() => {
    try {
      const savedMessages = chatStorage.load();
      setChatHistory(savedMessages);
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save chat history whenever it changes
  useEffect(() => {
    if (isInitialized && chatHistory) {
      chatStorage.save(chatHistory);
    }
  }, [chatHistory, isInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: message,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      // Prepare conversation history (excluding timestamps for API)
      const messageHistory = chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message,
          history: messageHistory 
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const botMessage: ChatMessage = { 
        role: 'assistant', 
        content: data.response,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    chatStorage.clear();
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all z-50"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          )}
        </svg>
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-20 right-4 w-full max-w-sm bg-white dark:bg-black shadow-xl rounded-lg transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        } z-40 md:max-w-md`}
      >
        <div className="flex flex-col h-[600px] max-h-[80vh]">
          {/* Chat Header */}
          <div className="p-4 border-b dark:border-neutral-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Chat with AI</h3>
            {chatHistory && chatHistory.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-sm text-red-500 hover:text-red-600"
              >
                Clear Chat
              </button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory && chatHistory.map((msg) => (
              <div
                key={msg.timestamp}
                className={`flex ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-neutral-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t dark:border-neutral-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded dark:bg-neutral-900 dark:border-neutral-800"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 