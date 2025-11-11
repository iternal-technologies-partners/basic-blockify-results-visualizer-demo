import CONFIG from './config';

const LOCAL_PARAMS = {
  llmBaseUrl: CONFIG.LLM_BASE_URL,
  llmApiPath: CONFIG.LLM_API_PATH,
  model: CONFIG.DEFAULT_MODEL,
  appName: 'Blockify Local Demo',
  customerName: 'User',
};

let params;
if (
  window.location.hostname.includes('localhost') ||
  window.location.hostname.includes('127.0.0.1') ||
  window.location.href.startsWith('file://')
) {
  params = LOCAL_PARAMS;
} else {
  // Still use local params for production builds
  params = LOCAL_PARAMS;
}

export default params;
