import Dexie from 'dexie';

// Create the database
const db = new Dexie('BlockifyDemoDatabase');

// Define schema - version 1
db.version(1).stores({
  chats: 'itemUUID, lastUpdated, isStarred',
  messages: '++id, chatId, timestamp'
});

// Chat operations
export const chatDB = {
  // Get all chats (metadata only, without messages for performance)
  async getAllChats() {
    const chats = await db.chats.orderBy('lastUpdated').reverse().toArray();
    return chats;
  },

  // Get a single chat with all its messages
  async getChat(itemUUID) {
    const chat = await db.chats.get(itemUUID);
    if (chat) {
      const messages = await db.messages
        .where('chatId')
        .equals(itemUUID)
        .sortBy('timestamp');
      return { ...chat, messages };
    }
    return null;
  },

  // Create a new chat
  async createChat(chatData) {
    const { messages = [], ...chatMeta } = chatData;
    
    await db.transaction('rw', db.chats, db.messages, async () => {
      await db.chats.put({
        ...chatMeta,
        lastUpdated: chatMeta.lastUpdated || Date.now()
      });
      
      // Add any initial messages
      if (messages.length > 0) {
        const messagesWithChatId = messages.map(msg => ({
          ...msg,
          chatId: chatData.itemUUID
        }));
        await db.messages.bulkPut(messagesWithChatId);
      }
    });
    
    return chatData;
  },

  // Update chat metadata
  async updateChat(itemUUID, updates) {
    await db.chats.update(itemUUID, {
      ...updates,
      lastUpdated: Date.now()
    });
  },

  // Add a message to a chat
  async addMessage(chatId, message) {
    const messageWithMeta = {
      ...message,
      chatId,
      timestamp: message.timestamp || Date.now()
    };
    
    await db.transaction('rw', db.chats, db.messages, async () => {
      await db.messages.add(messageWithMeta);
      await db.chats.update(chatId, { lastUpdated: Date.now() });
    });
    
    return messageWithMeta;
  },

  // Get messages for a chat
  async getMessages(chatId) {
    return await db.messages
      .where('chatId')
      .equals(chatId)
      .sortBy('timestamp');
  },

  // Delete a chat and all its messages
  async deleteChat(itemUUID) {
    await db.transaction('rw', db.chats, db.messages, async () => {
      await db.messages.where('chatId').equals(itemUUID).delete();
      await db.chats.delete(itemUUID);
    });
  },

  // Star/unstar a chat
  async toggleStar(itemUUID, isStarred) {
    await db.chats.update(itemUUID, { isStarred });
  },

  // Clear all data (for debugging/reset)
  async clearAll() {
    await db.transaction('rw', db.chats, db.messages, async () => {
      await db.chats.clear();
      await db.messages.clear();
    });
  },

  // Migrate from localStorage (one-time migration)
  async migrateFromLocalStorage() {
    const CHAT_HISTORY_KEY = 'blockify-demo-history';
    const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
    
    if (storedChats) {
      try {
        const chats = JSON.parse(storedChats);
        
        await db.transaction('rw', db.chats, db.messages, async () => {
          for (const chat of chats) {
            const { messages = [], ...chatMeta } = chat;
            
            // Store chat metadata
            await db.chats.put(chatMeta);
            
            // Store messages separately
            if (messages.length > 0) {
              const messagesWithChatId = messages.map(msg => ({
                ...msg,
                chatId: chat.itemUUID
              }));
              await db.messages.bulkPut(messagesWithChatId);
            }
          }
        });
        
        // Clear localStorage after successful migration
        localStorage.removeItem(CHAT_HISTORY_KEY);
        console.log('Successfully migrated chat history from localStorage to IndexedDB');
        return true;
      } catch (err) {
        console.error('Error migrating from localStorage:', err);
        return false;
      }
    }
    return false;
  }
};

export default db;

