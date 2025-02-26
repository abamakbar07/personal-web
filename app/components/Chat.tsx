'use client'

import { useState, useEffect, useRef } from 'react';
import { chatStorage } from '../utils/chatStorage';

interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsFullscreen(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        chatContainerRef.current && 
        !chatContainerRef.current.contains(event.target as Node) &&
        isOpen &&
        !isFullscreen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isFullscreen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    // Clear input immediately
    setMessage('');
    
    setIsLoading(true);
    const userMessage: ChatMessage = { 
      role: 'user', 
      content: trimmedMessage,
      timestamp: Date.now()
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
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
          message: trimmedMessage,
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
      const errorMessage: ChatMessage = {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    chatStorage.clear();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-all z-50 ${
          isOpen && isFullscreen ? 'hidden' : ''
        }`}
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

      <div
        ref={chatContainerRef}
        className={`fixed ${
          isFullscreen && isOpen
            ? 'inset-0 rounded-none'
            : 'bottom-20 right-4 w-full max-w-sm md:max-w-md rounded-lg'
        } bg-white dark:bg-neutral-900 shadow-xl transition-all duration-300 transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
        } z-40 border border-neutral-200 dark:border-neutral-800`}
      >
        <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'h-[600px] max-h-[80vh]'}`}>
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Chat with AI</h3>
            <div className="flex gap-2">
              {chatHistory && chatHistory.length > 0 && (
                <button
                  onClick={handleClearChat}
                  className="text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                >
                  Clear Chat
                </button>
              )}
              {isFullscreen && (
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-sm text-neutral-500 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-300"
                >
                  Close
                </button>
              )}
            </div>
          </div>

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
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-400"
                style={{ minWidth: 0 }}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minWidth: '4rem' }}
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