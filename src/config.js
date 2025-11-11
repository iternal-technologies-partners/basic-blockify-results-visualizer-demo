/**
 * Configuration for Local LLM Demo
 * 
 * Edit these values to match your local LLM server setup
 */

const CONFIG = {
  // Local LLM Server Configuration
  // Common defaults:
  // - LM Studio: http://localhost:1234
  // - Ollama: http://localhost:11434
  // - text-generation-webui: http://localhost:5000
  // - LocalAI: http://localhost:8080
  LLM_BASE_URL: 'http://localhost:3153',
  
  // API endpoint path (OpenAI-compatible)
  // Most servers use: /v1/chat/completions
  // Ollama uses: /api/chat
  LLM_API_PATH: '/v1/chat/completions',
  
  // Model name (can be overridden by your LLM server)
  DEFAULT_MODEL: 'jbh4/Meta-Llama-3.1-8B-Instruct-Reference-8b-v2.0.1-ingest-c813d455',
  
  // Request parameters
  DEFAULT_TEMPERATURE: 0.5,
  DEFAULT_MAX_TOKENS: 12048,
  DEFAULT_TOP_P: 1,
  
  // UI Configuration
  MAX_INPUT_LENGTH: 50000, // Increased for local use
};

export default CONFIG;

