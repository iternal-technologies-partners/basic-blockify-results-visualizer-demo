/**
 * API Helper for Local LLM Demo
 * Direct communication with localhost LLM server (OpenAI-compatible)
 */

import CONFIG from '../config';

/**
 * Call local LLM with OpenAI-compatible API format
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Optional parameters (temperature, max_tokens, etc.)
 * @returns {Promise<Response>} - Fetch response object
 */
const callLocalLLM = async (messages, options = {}) => {
  const url = `${CONFIG.LLM_BASE_URL}${CONFIG.LLM_API_PATH}`;
  
  const requestBody = {
    model: options.model || CONFIG.DEFAULT_MODEL,
    messages: messages,
    temperature: options.temperature !== undefined ? options.temperature : CONFIG.DEFAULT_TEMPERATURE,
    max_tokens: options.max_tokens || CONFIG.DEFAULT_MAX_TOKENS,
    top_p: options.top_p || CONFIG.DEFAULT_TOP_P,
    stream: options.stream || false,
    ...options,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorMessage = `LLM request failed: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse error as JSON, use the status message
      }
      throw new Error(errorMessage);
    }

    return response;
  } catch (error) {
    // Check if it's a network/connection error
    if (error.message.includes('fetch') || error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') || error.message.includes('ECONNREFUSED')) {
      throw new Error(
        `Cannot connect to local LLM at ${url}. ` +
        `Please ensure your LLM server is running and accessible. ` +
        `Current configuration: ${CONFIG.LLM_BASE_URL}${CONFIG.LLM_API_PATH}`
      );
    }
    throw error;
  }
};

/**
 * Get LLM configuration for display/debugging
 */
const getLLMConfig = () => {
  return {
    baseUrl: CONFIG.LLM_BASE_URL,
    apiPath: CONFIG.LLM_API_PATH,
    fullUrl: `${CONFIG.LLM_BASE_URL}${CONFIG.LLM_API_PATH}`,
    model: CONFIG.DEFAULT_MODEL,
  };
};

export {
  callLocalLLM,
  getLLMConfig,
};
