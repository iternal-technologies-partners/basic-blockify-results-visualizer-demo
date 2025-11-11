import React, { useState, useEffect, useRef } from 'react';

// Import UI elements
import BrainImage from '../images/brain.png';
import UserImage from '../images/user.png';
import { AirgapSendButton } from './icons';

// Import utilities
import markdownRenderer from '../utils/markdown';
import { callLocalLLM } from '../utils/apiHelper';
import { splitTextIntoChunks } from '../logic/utils';

// Import CSS
import '../static/css/iternal.css';

// Parse and format ideablock XML structure
const parseIdeaBlocks = (content) => {
  // Check if content contains ideablock tags
  if (!content.includes('<ideablock>')) {
    // Return plain HTML without markdown styling - preserve line breaks and whitespace
    return content.replace(/\n/g, '<br>');
  }

  // Extract all ideablock sections
  const ideaBlockRegex = /<ideablock>([\s\S]*?)<\/ideablock>/g;
  const matches = [];
  let match;
  
  while ((match = ideaBlockRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  if (matches.length === 0) {
    return markdownRenderer.makeHtml(content);
  }

  // Parse each ideablock and format as HTML
  const formattedBlocks = matches.map((blockContent, index) => {
    const nameMatch = blockContent.match(/<name>(.*?)<\/name>/is);
    const questionMatch = blockContent.match(/<critical_question>(.*?)<\/critical_question>/is);
    const answerMatch = blockContent.match(/<trusted_answer>(.*?)<\/trusted_answer>/is);
    const tagsMatch = blockContent.match(/<tags>(.*?)<\/tags>/is);
    const keywordsMatch = blockContent.match(/<keywords>(.*?)<\/keywords>/is);
    
    // Extract entities
    const entityMatches = blockContent.match(/<entity>[\s\S]*?<\/entity>/g) || [];
    const entities = entityMatches.map(entityBlock => {
      const nameMatch = entityBlock.match(/<entity_name>(.*?)<\/entity_name>/is);
      const typeMatch = entityBlock.match(/<entity_type>(.*?)<\/entity_type>/is);
      return {
        name: nameMatch ? nameMatch[1].trim() : '',
        type: typeMatch ? typeMatch[1].trim() : ''
      };
    }).filter(entity => entity.name);

    if (nameMatch && questionMatch && answerMatch) {
      const name = nameMatch[1].trim();
      const question = questionMatch[1].trim();
      const answer = answerMatch[1].trim();
      const tags = tagsMatch ? tagsMatch[1].trim() : '';
      const keywords = keywordsMatch ? keywordsMatch[1].trim() : '';
      
      // Create entity list for display
      const entityList = entities.map(entity => entity.name).join('; ');
      const keywordsTags = keywords || tags;

      return `
        <div class="ideablock-card">
          <div class="ideablock-entity-header">
            <svg xmlns="http://www.w3.org/2000/svg" width="14.211" height="13.983" viewBox="0 0 14.211 13.983" style="margin-right: 12px;">
  <g id="Group_5168" data-name="Group 5168" transform="translate(-22.894 -23.718)">
    <path id="Path_47698" data-name="Path 47698" d="M50.744,17.123h0l-6.433-2.545a1.2,1.2,0,0,0-.707,0l-6.362,2.545a.559.559,0,0,0-.354.566v7.634a.559.559,0,0,0,.354.566l6.433,2.545h0a.637.637,0,0,0,.354.071V20.516a.559.559,0,0,1,.354-.566l6.574-2.615Q50.85,17.123,50.744,17.123Z" transform="translate(-13.992 9.193)" fill="#61b2ed"/>
    <path id="Path_47699" data-name="Path 47699" d="M50.813,17.123h0l-6.432-2.545a1.2,1.2,0,0,0-.707,0l-6.362,2.545c-.071.071-.141.071-.212.141l7.14,2.828s.141-.141.212-.141l6.575-2.616Q50.92,17.123,50.813,17.123Z" transform="translate(-14.064 9.193)" fill="#b2deff"/>
    <path id="Path_47700" data-name="Path 47700" d="M54.058,18.854a.54.54,0,0,0-.141-.354l-6.575,2.616a.559.559,0,0,0-.353.566V29.67a.637.637,0,0,0,.354-.071h0L53.7,27.053a.559.559,0,0,0,.354-.566Z" transform="translate(-16.953 8.028)" fill="#2a82c3"/>
  </g>
</svg>

            ${entityList || '[ENTITY NAME HERE]; [ENTITY 2 NAME HERE]'}
          </div>
          
          <div class="ideablock-name">
            ${name}
          </div>
          
          <div class="ideablock-question">
            ${question}
          </div>
          
          <div class="ideablock-answer">
            ${answer}
          </div>
          
          ${keywordsTags ? `
          <div class="ideablock-keywords-container" style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${keywordsTags.split(',').map(keyword => `<div class="ideablock-keywords-pill">${keyword.trim()}</div>`).join('')}
          </div>
          ` : `
          <div class="ideablock-keywords-container" style="display: flex; flex-wrap: wrap; gap: 4px;">
            <div class="ideablock-keywords-pill">[Keywords / Tags Here]</div>
          </div>
          `}
        </div>
      `;
    }
    return '';
  }).filter(block => block.length > 0);

  // If we have formatted blocks, return them joined together
  if (formattedBlocks.length > 0) {
    return formattedBlocks.join('');
  }

  // Fallback to plain HTML without markdown styling
  return content.replace(/\n/g, '<br>');
};

// ChatWithAi component - main chat interface
const ChatWithAi = ({ pageParams }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [chunkProgress, setChunkProgress] = useState({ current: 0, total: 0 });
  const messagesContainerRef = useRef(null);
  const leftScrollRef = useRef(null);
  const rightScrollRef = useRef(null);
  const textAreaRef = useRef(null);

  // Load messages from pageParams.chatHistory if provided
  useEffect(() => {
    if (pageParams.chatHistory && pageParams.chatHistory.length > 0) {
      setMessages(pageParams.chatHistory);
    }
  }, [pageParams.chatHistory]);

  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);

  // Handle initial message from NewChat
  useEffect(() => {
    const handleInitialMessage = () => {
      // Check if this is a new chat with an initial message that hasn't been processed yet
      if (pageParams.initialMessage && !isGenerating) {
        const initialMsg = pageParams.initialMessage;

        // Check if the initial message already exists in the chat history
        const initialMessageExists = pageParams.chatHistory &&
          pageParams.chatHistory.some(msg =>
            msg.role === 'user' && msg.content === initialMsg
          );

        // Only process if the initial message doesn't already exist in chat history
        // and if we don't have any messages loaded yet
        if (!initialMessageExists && messages.length === 0) {
          console.log('Processing new initial message:', initialMsg);

          // Create a user message from the initial message
          const userMessage = { role: 'user', content: initialMsg };

          // Add to messages
          setMessages([userMessage]);

          // Notify parent about the message
          if (pageParams.onNewMessage) {
            pageParams.onNewMessage(initialMsg, 'user');
          }

          // Automatically send this initial message to LLM
          // Using a timeout to ensure state is updated first
          setTimeout(() => {
            const messagesWithInitial = [userMessage];
            sendToLLM(userMessage, messagesWithInitial);
          }, 100);
        }
      } else if (pageParams.template && !isGenerating && messages.length === 0) {
        // If using a template, use the template's system prompt only
        // Do not add any default user message
        const templatePrompt = pageParams.template.prompt || pageParams.template.description ||
          `You are a ${pageParams.template.name} assistant. Help the user with their query.`;

        // Add template message as system message only, with no user message
        const systemMessage = { role: 'system', content: templatePrompt, isComplete: true };
        setMessages([systemMessage]);
      }
    };

    // Call the function to handle initial message
    handleInitialMessage();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageParams.initialMessage, pageParams.template, pageParams.chatHistory]);

  // Auto-focus textarea after message is sent
  useEffect(() => {
    if (!isGenerating && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isGenerating]);

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Process a single chunk of text
  const processChunk = async (chunkText, chunkMetadata, conversationMessages) => {
    console.log(`Processing chunk ${chunkMetadata.index + 1}/${chunkMetadata.totalChunks}:`, chunkText.substring(0, 50) + '...');

    // Create a modified conversation with this chunk
    const chunkMessages = [
      ...conversationMessages.slice(0, -1), // All messages except the last user message
      {
        role: 'user',
        content: chunkMetadata.totalChunks > 1 
          ? `[Part ${chunkMetadata.index + 1} of ${chunkMetadata.totalChunks}]\n\n${chunkText}`
          : chunkText
      }
    ];

    // Call local LLM with OpenAI-compatible format
    const response = await callLocalLLM(chunkMessages, {
      temperature: 0.5,
      max_tokens: 12048,
      stream: false,
    });

    // Handle the response
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('text/plain')) {
      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let aiResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (!parsed.choices || !parsed.choices.length) continue;

              const content = parsed.choices[0]?.delta?.content || '';
              aiResponse += content;
            } catch (err) {
              console.error('Error parsing chunk:', err, line);
            }
          }
        }
      }

      return aiResponse;
    } else {
      // Handle JSON response (standard OpenAI format)
      const responseData = await response.json();

      let aiResponse = '';
      
      if (responseData.choices && responseData.choices.length > 0) {
        aiResponse = responseData.choices[0].message?.content || 
                     responseData.choices[0].text || 
                     '';
      } else if (responseData.response) {
        aiResponse = responseData.response;
      } else if (responseData.content) {
        aiResponse = responseData.content;
      }

      if (!aiResponse) {
        throw new Error('Invalid response format from LLM. Expected OpenAI-compatible format with choices[0].message.content');
      }

      return aiResponse;
    }
  };

  // Separate function to send message to LLM that can be reused
  const sendToLLM = async (userMessage, currentMessages = null) => {
    if (isGenerating) return;

    setIsGenerating(true);
    setError(null);
    setChunkProgress({ current: 0, total: 0 });

    try {
      console.log('Sending message to local LLM:', userMessage.content);

      // Build conversation history for context
      const messagesToSend = currentMessages || messages;
      
      // Convert to OpenAI format (role: 'user' | 'assistant' | 'system')
      const conversationMessages = messagesToSend
        .filter(msg => msg.role !== 'system' || msg.role === 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'assistant' : msg.role === 'system' ? 'system' : 'user',
          content: msg.content
        }));

      // Check if we need to chunk the message
      const messageText = userMessage.content;
      const chunks = splitTextIntoChunks(messageText, 2000, 200);
      
      console.log(`Message split into ${chunks.length} chunks`);
      
      if (chunks.length > 1) {
        setChunkProgress({ current: 0, total: chunks.length });
      }

      // Process all chunks and collect responses
      const chunkResponses = [];
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Update progress
        setChunkProgress({ current: i + 1, total: chunks.length });

        try {
          const chunkResponse = await processChunk(chunk.text, chunk, conversationMessages);
          chunkResponses.push({
            index: chunk.index,
            response: chunkResponse,
            success: true
          });

          // Add each chunk response as it completes
          const partialAssistantMessage = {
            role: 'assistant',
            content: chunkResponses.map(r => r.response).join('\n\n---\n\n'),
            isComplete: i === chunks.length - 1,
            chunkInfo: chunks.length > 1 ? {
              current: i + 1,
              total: chunks.length
            } : null
          };

          setMessages(prevMessages => {
            // Check if we already have an assistant message for this chunked response
            const lastMsg = prevMessages[prevMessages.length - 1];
            if (lastMsg && lastMsg.role === 'assistant' && !lastMsg.isComplete && lastMsg.chunkInfo) {
              // Update the existing message
              return [...prevMessages.slice(0, -1), partialAssistantMessage];
            } else {
              // Add new message
              return [...prevMessages, partialAssistantMessage];
            }
          });

          // Notify parent component about each chunk response
          if (pageParams.onNewMessage && i === chunks.length - 1) {
            const fullResponse = chunkResponses.map(r => r.response).join('\n\n---\n\n');
            pageParams.onNewMessage(fullResponse, 'assistant');
          }

        } catch (chunkError) {
          console.error(`Error processing chunk ${i + 1}:`, chunkError);
          chunkResponses.push({
            index: chunk.index,
            response: `[Error processing chunk ${i + 1}: ${chunkError.message}]`,
            success: false
          });
        }
      }

      // Finalize the message
      const finalContent = chunkResponses.map(r => r.response).join('\n\n---\n\n');
      const finalAssistantMessage = {
        role: 'assistant',
        content: finalContent,
        isComplete: true,
        chunkInfo: null
      };

      setMessages(prevMessages => {
        const lastMsg = prevMessages[prevMessages.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.chunkInfo) {
          return [...prevMessages.slice(0, -1), finalAssistantMessage];
        }
        return prevMessages;
      });

    } catch (err) {
      console.error('Error calling local LLM:', err);
      setError(err.message);

      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error processing your request: ${err.message}`,
        isError: true,
        isComplete: true
      };

      setMessages(prevMessages => [...prevMessages, errorMessage]);

      // Notify parent about the error
      if (pageParams.onNewMessage) {
        pageParams.onNewMessage(errorMessage.content, 'assistant');
      }
    } finally {
      setIsGenerating(false);
      setChunkProgress({ current: 0, total: 0 });
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() === '' || isGenerating) return;

    const userMessage = { role: 'user', content: message };

    // Add user message to the conversation
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Notify parent component about the new message
    if (pageParams.onNewMessage) {
      pageParams.onNewMessage(message, 'user');
    }

    setMessage('');

    // Send to LLM with the updated messages context
    await sendToLLM(userMessage, updatedMessages);
  };

  // Check if this is a message history view (has existing chat history)
  const isMessageHistoryView = pageParams.chatHistory && pageParams.chatHistory.length > 0;

  const calculateInputLength = () => {
    return message.length;
  };

  // Message Component
  const Message = ({ role, content }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    // Ensure content is always a string
    const safeContent = typeof content === 'string' ? content : String(content || '');

    const messageWrapperStyle = {
      padding: '10px',
      borderBottom: '1px solid #e8e8e8',
      maxWidth: '1200px',
      position: 'relative',
    };

    const messageTextStyle = {
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
      textAlign: 'left',
      paddingBottom: '12px',
      paddingTop: '12px',
      gap: '12px',
      color: role === 'user' ? '#444' : 'inherit',
    };

    const actionContainerStyle = {
      display: 'flex',
      justifyContent: 'flex-start',
      marginTop: '5px',
      gap: '5px',
    };

    const actionButtonStyle = {
      backgroundColor: 'transparent',
      border: 'none',
      color: '#888',
      fontSize: '12px',
      cursor: 'pointer',
      padding: '4px 8px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
    };

    return (
      <>
        <div style={messageWrapperStyle}>
          <div
            style={messageTextStyle}
            dangerouslySetInnerHTML={{ __html: parseIdeaBlocks(safeContent) }}
          ></div>
        </div>
        <div style={actionContainerStyle}>
          <button style={actionButtonStyle} onClick={handleCopy}>
            <i className={`fa fa-${copied ? 'check' : 'copy'}`}></i>
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </>
    );
  };

  // Loading Indicator
  const LoadingIndicator = ({ key }) => {
    const loadingIndicatorStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      padding: '10px',
      margin: '10px 0',
    };

    const messageWrapperStyle = {
      padding: '10px',
      borderBottom: '1px solid #e8e8e8',
      maxWidth: '100%',
      position: 'relative',
      whiteSpace: 'pre-line',
    };

    const loadingDotsStyle = {
      display: 'flex',
      gap: '5px',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    };

    const dotStyle = {
      display: 'inline-block',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: '#888',
      animation: 'pulse 1.5s infinite ease-in-out',
    };

    return (
      <div style={loadingIndicatorStyle} key={key}>
        <div style={messageWrapperStyle}>
          <div style={loadingDotsStyle}>
            <span style={{ ...dotStyle, animationDelay: '0s' }}></span>
            <span style={{ ...dotStyle, animationDelay: '0.2s' }}></span>
            <span style={{ ...dotStyle, animationDelay: '0.4s' }}></span>
          </div>
        </div>
      </div>
    );
  };

  // Progress Bar Component
  const ProgressBar = ({ key }) => {
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
      // If we have chunk progress, use that; otherwise use time-based progress
      if (chunkProgress.total > 0) {
        const chunkProgressPercent = (chunkProgress.current / chunkProgress.total) * 100;
        setProgress(chunkProgressPercent);
      } else {
        // Start the progress bar animation for time-based progress
        const startTime = Date.now();
        const duration = 60000; // 60 seconds

        intervalRef.current = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const currentProgress = Math.min((elapsed / duration) * 100, 100);
          setProgress(currentProgress);

          // Stop the interval if we reach 100%
          if (currentProgress >= 100) {
            clearInterval(intervalRef.current);
          }
        }, 100); // Update every 100ms for smooth animation
      }

      // Cleanup interval on unmount
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, [chunkProgress]);

    // Clear interval when component unmounts or when isGenerating becomes false
    useEffect(() => {
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);

    const progressBarContainerStyle = {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
    };

    const progressBarWrapperStyle = {
      width: '100%',
      maxWidth: '600px',
      height: '16px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #e8e8e8',
    };

    const progressBarFillStyle = {
      height: '100%',
      backgroundColor: '#008B53',
      width: `${progress}%`,
      transition: 'width 0.1s ease-out',
    };

    const progressTextStyle = {
      fontSize: '14px',
      color: '#666',
      fontWeight: '500',
    };

    return (
      <div style={progressBarContainerStyle} key={key}>
        <div style={progressTextStyle}>
          {chunkProgress.total > 1 
            ? `Processing chunk ${chunkProgress.current} of ${chunkProgress.total}...`
            : 'Blockifying your data, this will take a moment...'
          }
        </div>
        <div style={progressBarWrapperStyle}>
          <div style={progressBarFillStyle}></div>
        </div>
        <div style={progressTextStyle}>
          {chunkProgress.total > 1 
            ? `Chunk ${chunkProgress.current}/${chunkProgress.total} (${Math.round(progress)}% complete)`
            : `${Math.round(progress)}% complete`
          }
        </div>
      </div>
    );
  };

  const chatAreaStyle = {
    width: '100%',
    height: '100vh',
    backgroundColor: '#f2f0e6',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerBarStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    height: '50px',
    width: '100%',
    marginBottom: '0px',
    borderBottom: '0px solid #ccc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px 100px 30px 100px',
    backgroundColor: '#f2f0e6',
  };

  const chatTitleStyle = {
    fontSize: '20px',
    fontWeight: 500,
    color: '#333',
  };

  const chatWindowStyle = {
    height: 'calc(100vh)', // Subtract header height
    display: 'grid',
    gridTemplateColumns: '1fr 1fr', // Two equal columns
    gap: '1px',
    backgroundColor: '#e8e8e8', // Gap color
  };

  const columnStyle = {
    backgroundColor: '#f2f0e6',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  };

  const columnHeaderStyle = {
    padding: '15px 20px',
    backgroundColor: '#fff',
    borderBottom: '1px solid #e8e8e8',
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    flexShrink: 0,
  };

  const messagesScrollAreaStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  };

  const leftColumnInputAreaStyle = {
    padding: '20px',
    backgroundColor: '#f2f0e6',
    borderTop: '1px solid #e8e8e8',
    flexShrink: 0,
  };

  const inputAreaWrapperStyle = {
    width: '100%',
    maxWidth: '600px', // Adjusted for column width
    margin: '0 auto',
    backgroundColor: '#f2f0e6',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid white',
    borderRadius: '24px',
    padding: '6px',
  };

  const inputWrapperStyle = {
    width: '100%',
    minHeight: '56px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    opacity: isGenerating ? 0.7 : 1,
    backgroundColor: '#f8f7f3',
    borderRadius: '18px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
  };

  const characterCountStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4px 8px',
    fontSize: '12px',
    color: calculateInputLength() > 10000 ? '#ff4d4d' : calculateInputLength() > 2000 ? '#ff9800' : '#666666',
    cursor: 'help',
  };

  const iconButtonStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    padding: '8px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
  };

  const disabledIconButtonStyle = {
    ...iconButtonStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <div style={chatAreaStyle}>
    {/* <div style={headerBarStyle}>
        <a href="https://iternal.ai/blockify-results/" target="_blank" rel="noopener noreferrer">Click here to read the report that explains how Blockify can improve AI accuracy by 78X.</a>
      </div>
*/}
      <div className="chat-two-columns">
        {/* Left Column - User Messages */}
        <div className="chat-column">
          <div className="chat-column-header">Raw Document Input</div>
          <div className="chat-messages-scroll" ref={leftScrollRef}>
            {messages.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'left', 
                alignItems: 'center', 
                height: '100%', 
                color: '#888',
                textAlign: 'center'
              }}>
                <div>Start a conversation by typing your message below</div>
              </div>
            ) : (
              messages
                .filter(message => message.role === 'user') // Only user messages
                .filter((message, index, self) => {
                  // Filter out duplicate consecutive messages
                  if (index === 0) return true;
                  const prevMessage = self[index - 1];
                  return !(message.role === prevMessage.role && message.content === prevMessage.content);
                })
                .map((message, index) => (
                  <Message
                    key={`user-${index}`}
                    role={message.role}
                    content={message.content}
                  />
                ))
            )}
          </div>
          
          {/* Input Area in Left Column */}
          {!isMessageHistoryView && (
            <div className="chat-left-column-input">
              <div style={inputAreaWrapperStyle}>
                <div style={inputWrapperStyle}>
                  <textarea
                    ref={textAreaRef}
                    placeholder="Type your message here..."
                    value={message}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    style={{
                      minHeight: '44px',
                      maxHeight: '120px',
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      backgroundColor: 'transparent',
                      width: '100%',
                      padding: '16px',
                      resize: 'none',
                    }}
                    rows={Math.min((message.length / 120) + 1, 5)}
                    disabled={isGenerating}
                  />
                  <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '2px 10px' }}>
                    <div></div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <div style={characterCountStyle} title={calculateInputLength() > 2000 ? "Large messages will be split into chunks" : ""}>
                        <span>{calculateInputLength()}</span>
                        {calculateInputLength() > 2000 && (
                          <span style={{ fontSize: '10px', marginTop: '2px' }}>
                            ({Math.ceil(calculateInputLength() / 1800)} chunks)
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={isGenerating || message.trim() === '' || calculateInputLength() > 10000}
                        title={calculateInputLength() > 2000 ? "This message will be split into chunks" : "Send message"}
                        style={{ ...iconButtonStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                      >
                        <AirgapSendButton size={24} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem', paddingTop: '10px', color: '#666', textAlign: 'center' }}>
                Messages sent to the Blockify Result may be stored and processed. Do not input confidential information.
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Assistant Messages */}
        <div className="chat-column">
          <div className="chat-column-header">Blockify Results</div>

          <div className="chat-messages-scroll" ref={rightScrollRef}>
            {messages.filter(message => message.role === 'assistant').length === 0 && !isGenerating ? (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%', 
                color: '#888',
                textAlign: 'center'
              }}>
                <div>AI responses will appear here</div>
              </div>
            ) : (
              messages
                .filter(message => message.role === 'assistant') // Only assistant messages
                .filter((message, index, self) => {
                  // Filter out duplicate consecutive messages
                  if (index === 0) return true;
                  const prevMessage = self[index - 1];
                  return !(message.role === prevMessage.role && message.content === prevMessage.content);
                })
                .map((message, index) => (
                  <Message
                    key={`assistant-${index}`}
                    role={message.role}
                    content={message.content}
                  />
                ))
            )}

            {isGenerating && <ProgressBar key="loading-indicator" />}

            {error && (
              <div className="bg-red-500 text-white p-2 mb-4 rounded">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWithAi;
