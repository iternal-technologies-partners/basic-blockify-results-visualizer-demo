import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

import ChatWithAi from '../components/ChatWithAi';
import ChatNav from '../components/ChatNav';
import NewChat from '../components/NewChat';

// Local storage key for chat history
const CHAT_HISTORY_KEY = 'blockify-demo-history';

const Chat = ({ pageParams }) => {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  
  // Load chat history from local storage
  useEffect(() => {
    const storedChats = localStorage.getItem(CHAT_HISTORY_KEY);
    if (storedChats) {
      try {
        setChatList(JSON.parse(storedChats));
      } catch (err) {
        console.error('Error parsing stored chats:', err);
        // Initialize with empty array if parse fails
        setChatList([]);
      }
    }
  }, []);
  
  // Find selected chat when selectedChatId changes
  useEffect(() => {
    if (selectedChatId && chatList.length > 0) {
      const chat = chatList.find(c => c.itemUUID === selectedChatId);
      setSelectedChat(chat || null);
    } else {
      setSelectedChat(null);
    }
  }, [selectedChatId, chatList]);
  
  // Save chat history to local storage when it changes
  useEffect(() => {
    if (chatList.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(chatList));
    }
  }, [chatList]);
  
  // Handle selecting a chat
  const handleChatSelect = (chatUUID) => {
    setSelectedChatId(chatUUID);
  };
  
  // Handle starring a chat
  const handleStarChat = (chatUUID, isStarred) => {
    setChatList(prevChats => 
      prevChats.map(chat => 
        chat.itemUUID === chatUUID ? { ...chat, isStarred } : chat
      )
    );
  };
  
  // Handle creating a new chat
  const handleNewChat = (chatData) => {
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
      // Don't pre-add the initial message to messages - let ChatWithAi handle it
      messages: []
    };
    
    setChatList(prevChats => [newChat, ...prevChats]);
    setSelectedChatId(newChat.itemUUID);
  };
  
  // Handle starting a new chat (going back to new chat view)
  const handleStartNewChat = () => {
    setSelectedChatId(null);
  };
  
  // Handle adding a message to the current chat
  const handleAddMessage = (message, role = 'user') => {
    if (!selectedChat) return;
    
    const newMessage = {
      role,
      content: message,
      timestamp: Date.now()
    };
    
    setChatList(prevChats => 
      prevChats.map(chat => {
        if (chat.itemUUID === selectedChat.itemUUID) {
          return {
            ...chat,
            messages: [...(chat.messages || []), newMessage],
            lastUpdated: Date.now()
          };
        }
        return chat;
      })
    );
  };
  
  // Handle going to settings
  const handleOpenSettings = () => {
    // Navigate to settings page (would need to be implemented)
    alert('Settings page not implemented yet');
  };
  
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
      
      <div 
        className="flex-grow flex"
        
      >
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