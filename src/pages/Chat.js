import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

import ChatWithAi from '../components/ChatWithAi';
import ChatNav from '../components/ChatNav';
import NewChat from '../components/NewChat';
import { chatDB } from '../logic/database';

const Chat = ({ pageParams }) => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load chat history from IndexedDB
  useEffect(() => {
    const initializeChats = async () => {
      try {
        // Try to migrate from localStorage first (one-time)
        await chatDB.migrateFromLocalStorage();
        
        // Load all chats from IndexedDB
        const chats = await chatDB.getAllChats();
        setChatList(chats);
      } catch (err) {
        console.error('Error loading chats:', err);
        setChatList([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeChats();
  }, []);
  
  // Load full chat data when selectedChatId changes
  useEffect(() => {
    const loadSelectedChat = async () => {
      if (selectedChatId) {
        try {
          const chat = await chatDB.getChat(selectedChatId);
          setSelectedChat(chat || null);
        } catch (err) {
          console.error('Error loading selected chat:', err);
          setSelectedChat(null);
        }
      } else {
        setSelectedChat(null);
      }
    };
    
    loadSelectedChat();
  }, [selectedChatId]);
  
  // Handle selecting a chat
  const handleChatSelect = useCallback((chatUUID) => {
    setSelectedChatId(chatUUID);
  }, []);
  
  // Handle starring a chat
  const handleStarChat = useCallback(async (chatUUID, isStarred) => {
    try {
      await chatDB.toggleStar(chatUUID, isStarred);
      setChatList(prevChats => 
        prevChats.map(chat => 
          chat.itemUUID === chatUUID ? { ...chat, isStarred } : chat
        )
      );
    } catch (err) {
      console.error('Error starring chat:', err);
    }
  }, []);
  
  // Handle creating a new chat
  const handleNewChat = useCallback(async (chatData) => {
    // If chatData doesn't include itemUUID, generate one
    if (!chatData.itemUUID) {
      chatData.itemUUID = uuidv4();
    }
    
    // Only use explicit initial message, don't create one automatically for templates
    const initialMessage = chatData.initialMessage || null;
    
    const newChat = {
      ...chatData,
      initialMessage,
      lastUpdated: Date.now(),
      messages: []
    };
    
    try {
      await chatDB.createChat(newChat);
      setChatList(prevChats => [newChat, ...prevChats]);
      setSelectedChatId(newChat.itemUUID);
    } catch (err) {
      console.error('Error creating chat:', err);
    }
  }, []);
  
  // Handle starting a new chat (going back to new chat view)
  const handleStartNewChat = useCallback(() => {
    setSelectedChatId(null);
  }, []);
  
  // Handle adding a message to the current chat
  const handleAddMessage = useCallback(async (message, role = 'user') => {
    if (!selectedChatId) return;
    
    const newMessage = {
      role,
      content: message,
      timestamp: Date.now()
    };
    
    try {
      await chatDB.addMessage(selectedChatId, newMessage);
      
      // Update selected chat with new message
      setSelectedChat(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: [...(prev.messages || []), newMessage],
          lastUpdated: Date.now()
        };
      });
      
      // Update chat list to reflect new lastUpdated
      setChatList(prevChats => 
        prevChats.map(chat => {
          if (chat.itemUUID === selectedChatId) {
            return { ...chat, lastUpdated: Date.now() };
          }
          return chat;
        })
      );
    } catch (err) {
      console.error('Error adding message:', err);
    }
  }, [selectedChatId]);
  
  // Handle going to settings
  const handleOpenSettings = useCallback(() => {
    alert('Settings page not implemented yet');
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <div className="text-gray-500">Loading chats...</div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen w-screen">
      <ChatNav 
        chatList={chatList}
        selectedChatUUID={selectedChatId}
        onChatSelect={handleChatSelect}
        onNewChat={handleStartNewChat}
        onStarChat={handleStarChat}
        onOpenSettings={handleOpenSettings}
      />
      
      <div className="flex-grow flex">
        {!selectedChatId ? (
          <NewChat 
            onStartChat={handleNewChat}
            onAddData={() => alert('Add data functionality not implemented yet')}
          />
        ) : (
          <ChatWithAi 
            pageParams={{
              ...pageParams,
              chatHistory: selectedChat?.messages || [],
              initialMessage: selectedChat?.initialMessage,
              template: selectedChat?.template,
              useCorpus: selectedChat?.useCorpus,
              onNewMessage: handleAddMessage
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Chat;
