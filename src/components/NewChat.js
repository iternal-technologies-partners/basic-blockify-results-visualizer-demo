import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Upload, AirgapSendButton, CorpusIcon } from './icons';

// Styled components
const NewChatWindow = ({ children }) => (
  <div style={{
    width: '100%',
    margin: '0 auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    height: '100vh',
    backgroundColor: '#f2f0e6',
    justifyContent: 'center',
  }}>
    {children}
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    style={{
      padding: '12px 24px',
      borderRadius: '18px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: '#f8f7f3',
      color: '#333',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'all 0.2s',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    }}
    onClick={onClick}
  >
    {label}
  </button>
);

const SuggestedActions = ({ actions, onSelect }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    width: '100%',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  }}>

    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '10px',
      justifyContent: 'center',
      width: '100%',
    }}>
      {actions.map((action) => (
        <ActionButton
          key={action.value}
          label={action.label}
          onClick={() => onSelect(action.value)}
        />
      ))}
    </div>
  </div>
);

// Main component
const NewChat = ({ onStartChat, onAddData, chatTemplates = [] }) => {
  const [message, setMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const textAreaRef = useRef(null);
  
  // Auto-focus the textarea when component mounts
  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, []);
  
  // Use imported templates
  const templates = chatTemplates;
  
  const handleTextEntry = (e) => {
    const newMessage = e.target.value;
    // Enforce character limit
    if (newMessage.length <= 10000) {
      setMessage(newMessage);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleSubmit = () => {
    if (message.trim() && !isCreating) {
      setIsCreating(true);
      
      // Create basic chat structure
      const chatData = {
        itemUUID: uuidv4(),
        name: message.length > 30 ? `${message.slice(0, 30)}...` : message,
        lastUpdated: Date.now(),
        isStarred: false,
        initialMessage: message,
      };
      
      // Call parent handler
      onStartChat(chatData);
      
      // Reset state
      setMessage('');
      setIsCreating(false);
    }
  };
  
  const handlePromptSelect = (promptId) => {
    const selectedTemplate = templates.find(t => t.value === promptId);
    if (selectedTemplate) {
      // Create chat from template
      const chatData = {
        itemUUID: uuidv4(),
        name: selectedTemplate.name,
        lastUpdated: Date.now(),
        isStarred: false,
        template: selectedTemplate,
      };
      
      onStartChat(chatData);
    }
  };


  const chatTitleStyle = {
    fontSize: '20px',
    fontWeight: 500,
    color: '#333',
  };

  const inputAreaWrapperStyle = {
    width: '75%',
    maxWidth: '1200px',
    backgroundColor: '#f2f0e6',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid white',
    borderRadius: '24px',
    padding: '6px',
    marginBottom: '20px',
    alignSelf: 'center',
  };

  const inputWrapperStyle = {
    width: '100%',
    minHeight: '56px',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    opacity: isCreating ? 0.7 : 1,
    backgroundColor: '#f8f7f3',
    borderRadius: '18px',
    border: '1px solid rgba(0, 0, 0, 0.1)',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
    transition: 'all 0.2s',
  };

  const actionButtonStyle = {
    padding: '8px 16px',
    backgroundColor: '#0066cc',
    color: 'white',
    border: 'none',
    borderRadius: '18px',
    cursor: message.trim() && !isCreating ? 'pointer' : 'not-allowed',
    opacity: message.trim() && !isCreating ? 1 : 0.6,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const suggestedActionsStyle = {
    position: 'relative',
    width: '100%',
    marginTop: '0px'
  };

  const footerStyle = {
    position: 'absolute',
    bottom: '15px',
    width: '100%',
    textAlign: 'center',
    color: '#666',
    padding: '0 20px',
    fontSize: '0.8rem'
  };
  
  return (
    <NewChatWindow>
      <div style={{
        maxWidth: '400px',
        margin: '0 auto',
        paddingBottom: '20px'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="auto" height="auto" viewBox="0 0 1545.863 322.017">
          <g id="Group_5198" data-name="Group 5198" transform="translate(-544 -1587.983)">
            <g id="Group_5197" data-name="Group 5197" transform="translate(20481 11824)">
              <g id="Group_4181" data-name="Group 4181" transform="translate(-19936.996 -10236.017)">
                <path id="Path_47698" data-name="Path 47698" d="M356.03,74.357h0L207.878,15.746a27.742,27.742,0,0,0-16.283,0L45.071,74.357A12.875,12.875,0,0,0,36.93,87.384V263.2a12.875,12.875,0,0,0,8.141,13.041l148.152,58.611h0a14.678,14.678,0,0,0,8.142,1.628V152.5a12.875,12.875,0,0,1,8.141-13.026L360.915,79.242Q358.469,74.357,356.03,74.357Z" transform="translate(-36.89 -14.525)" fill="#3aa4e2" />
                <path id="Path_47699" data-name="Path 47699" d="M352.914,74.357h0L204.784,15.746a27.742,27.742,0,0,0-16.283,0L41.985,74.357c-1.628,1.628-3.257,1.628-4.885,3.257l164.428,65.132s3.257-3.257,4.885-3.257L357.829,79.242Q355.383,74.357,352.914,74.357Z" transform="translate(-33.814 -14.525)" fill="#efefef" />
                <path id="Path_47700" data-name="Path 47700" d="M209.836,26.641a12.436,12.436,0,0,0-3.257-8.141L55.163,78.739a12.875,12.875,0,0,0-8.134,13.026v183.96A14.678,14.678,0,0,0,55.17,274.1h0l146.524-58.611a12.875,12.875,0,0,0,8.141-13.026Z" transform="translate(117.441 46.217)" fill="#007ec7" />
              </g>
            </g>
            <path id="path0" d="M209.337,122.186v69.457l57.657-.012c72.332-.016,77.2-.546,86.662-9.427,5.982-5.621,6.541-7.654,6.812-24.776.394-25.211-4.012-32.787-21.277-36.568q-4.4-.967,2.106-2.3c13.718-2.833,18.609-10.951,18.584-30.853-.029-19.606-2.476-26.172-11.612-31.144-6.8-3.7-8.5-3.786-76.483-3.81l-62.449-.025v69.462m115.605-45.68c4.693,2.394,5.182,3.827,5.182,15.225,0,17.307,3.765,16.034-48.073,16.268l-41.233.189V75.308h40.888c37.578,0,41.081.1,43.236,1.2m85.59,64.5v50.64h104.7V173.179L475.375,173l-39.861-.177-.177-41.233-.177-41.229H410.532V141M556.846,91.1C541.777,93.312,540.9,96.055,540.9,141c0,54.512-5.05,50.586,65.134,50.619,70.48.037,66.411,3.511,65.742-56.092-.435-38.995-1.606-42.111-16.72-44.415-5.839-.891-92.143-.9-98.208-.012m172.006-.057C712.9,93.452,712.173,95.78,712.5,143.057c.353,51.8-3.515,48.6,58.663,48.574,54.959-.021,56.47-.71,56.474-25.65l0-10.265-10.951-2.188c-6.024-1.207-11.489-2.2-12.146-2.225-1.092-.029-1.2.916-1.2,10.581V172.5l-33.361-.177-33.361-.181V109.182l33.361-.177,33.361-.181v9.247c0,10.655-.772,9.85,7.966,8.278,2.956-.534,7.953-1.347,11.1-1.807l5.724-.838-.32-9.317c-.5-14.6-3.08-19.59-11.6-22.419-3.991-1.322-79.419-2.123-87.364-.924M869.039,141v50.64h24.62l.177-22.912.181-22.907,4.566,3.236c2.509,1.778,11.406,8.163,19.771,14.186s19.713,14.182,25.223,18.132,10.9,7.879,11.973,8.725c1.922,1.515,2.267,1.54,21.429,1.54h19.475l-5.026-3.453c-2.763-1.9-8.721-6.052-13.238-9.23s-10.212-7.153-12.659-8.832C945.568,156.414,919.5,137.8,919.49,137.239c-.008-.374,15.381-11,34.2-23.61L987.9,90.705l-17.356-.181L953.2,90.34l-11.456,7.953c-6.3,4.373-12.532,8.709-13.849,9.637s-5.322,3.683-8.894,6.122-10.507,7.19-15.4,10.557-9.128,6.126-9.411,6.126-.513-9.078-.513-20.185V90.364H869.039V141m149.184,0v50.64h23.955V90.364h-23.955V141m69.121,0v50.64h25.318V154.008h43.8V134.845h-43.8V108.156h82.12V90.364H1087.344V141m133.561-32.335c10.01,10.068,22.39,22.563,27.519,27.765l9.321,9.456v45.753h24.636V145.459l27.539-27.547,27.543-27.547H1308.61l-6.738,7.013c-3.7,3.86-11.949,12.351-18.321,18.871L1271.968,128.1l-1.7-1.589c-.936-.875-9.115-9.366-18.177-18.871l-16.469-17.278h-32.906l18.194,18.3M646.974,140.663V172.14l-40.892.177-40.888.177V108.829l40.888.177,40.892.177v31.481m-321.859-8.1c5.091,2.353,5.7,4.081,5.7,16.313,0,18.8,2.845,17.726-47.831,18.013-21.409.123-39.656.037-40.547-.185l-1.614-.406V148.974c0-9.526.218-17.541.484-17.808,1.429-1.429,80.556-.111,83.812,1.4" transform="translate(752.4 1629.167)" fill-rule="evenodd" />
          </g>
        </svg>

        

      </div>
      
      <div style={{
        fontSize: '24px',
        fontWeight: 500,
        color: '#333',
        paddingBottom: '20px',
        textAlign: 'center'
      }}>
        Welcome! Paste in the text you would like to Blockify® to see <br /> how we optimize your data for 78X accuracy.
      </div>
      <div style={inputAreaWrapperStyle}>
        <div style={inputWrapperStyle}>
          <textarea
            ref={textAreaRef}
            placeholder="Paste in the text you would like to Blockify® to see how we optimize your data for 78X accuracy..."
            value={message}
            onChange={handleTextEntry}
            onKeyDown={handleKeyDown}
            maxLength={10000}
            style={{ 
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              borderRadius: '18px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '500',
              resize: 'vertical',
              backgroundColor: 'transparent',
              outline: 'none',
            }}
            rows={5}
            disabled={isCreating}
          />
          
          <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '2px 10px 10px' }}>
            <div style={{
              fontSize: '12px',
              color: message.length > 9800 ? '#ff6b6b' : '#666',
              fontWeight: '500'
            }}>
              {message.length}/10000
            </div>
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || isCreating}
              style={actionButtonStyle}
            >
              Start Blockify
              <AirgapSendButton size={22} />
            </button>
          </div>
        </div>
      </div>
      
      <div style={{
        width: '75%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <a 
          href="https://iternal.ai/blockify-results/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            padding: '12px 24px',
            marginTop: '40px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'rgb(255, 255, 255)',
            backgroundColor: '#009ef9',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.2s',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
            display: 'inline-block',
            textAlign: 'center'
          }}
        >
          Read the report that explains how Blockify can improve AI accuracy by 78X.
        </a>
      </div>
      
      <div style={suggestedActionsStyle}>
        <SuggestedActions 
          actions={templates.filter(t => !t.disabled)} 
          onSelect={handlePromptSelect}
        />
      </div>
      
      <div style={footerStyle}>
        Messages sent to the Blockify Result may be stored and processed. Do not input confidential information.
      </div>
    </NewChatWindow>
  );
};

export default NewChat;
