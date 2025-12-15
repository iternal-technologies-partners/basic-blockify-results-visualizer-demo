# Quick Start Guide

## Setup in 3 Steps

### 1. Install LM Studio (Easiest Option) or other OpenAI API Compatible

- Download from https://lmstudio.ai/
- Install and open LM Studio
- Download a model (e.g., https://blockify.ai/customer-download)
- Go to "Local Server" tab and click "Start Server"
- Default: http://localhost:3153

### 2. Configure the Demo

Edit `src/config.js`:

```javascript
const CONFIG = {
  LLM_BASE_URL: 'http://localhost:3153',  // Your LLM server URL
  LLM_API_PATH: '/v1/chat/completions',   // Keep this as-is for LM Studio
  DEFAULT_MODEL: 'blockify',
  DEFAULT_TEMPERATURE: 0.5,
  DEFAULT_MAX_TOKENS: 12048,
};
```

### 3. Run the Demo

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

1. Paste text into the input area
2. Click "Start Blockify"
3. See results in the two-column layout

## Troubleshooting

If you encounter a Cross-Origin Resource Sharing (CORS) error in your browser console, follow these steps to resolve the issue:
1. Stop and restart the development server.
2. Perform a hard refresh of the browser page to clear the cache and reload the application.
