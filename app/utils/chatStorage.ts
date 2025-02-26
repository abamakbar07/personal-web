interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface StorageData {
  messages: ChatMessage[];
  expiryTime: number;
}

const CHAT_STORAGE_KEY = 'chatHistory';
const EXPIRY_HOURS = 24;

export const chatStorage = {
  save: (messages: ChatMessage[]) => {
    try {
      const data: StorageData = {
        messages,
        expiryTime: Date.now() + (EXPIRY_HOURS * 60 * 60 * 1000) // 24 hours from now
      };
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  },

  load: (): ChatMessage[] => {
    try {
      const data = localStorage.getItem(CHAT_STORAGE_KEY);
      if (!data) return [];

      const parsedData = JSON.parse(data) as StorageData;
      
      // Check if data has the expected structure
      if (!parsedData.messages || !parsedData.expiryTime) {
        chatStorage.clear();
        return [];
      }

      // Clear chat if expired
      if (Date.now() > parsedData.expiryTime) {
        chatStorage.clear();
        return [];
      }

      return parsedData.messages;
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(CHAT_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }
}; 