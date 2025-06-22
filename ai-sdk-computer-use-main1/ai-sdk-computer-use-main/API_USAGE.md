# AI SDK Computer Use - API Documentation

This application now provides both the original chat interface and an OpenAI-compatible API for programmatic access to the computer use capabilities.

## Changes Made

### 1. Removed System Prompt
- The original system prompt has been removed from the chat interface
- The AI now operates without predefined instructions about computer use

### 2. OpenAI Compatible API

The application now exposes OpenAI-compatible endpoints:

#### Base URL
**Local Development:**
```
http://localhost:3000/api/v1
```

**Production (Vercel):**
```
https://your-app-name.vercel.app/api/v1
```

#### Endpoints

##### Chat Completions
```
POST /api/v1/chat/completions
```

**Request Body:**
```json
{
  "model": "claude-3-7-sonnet-20250219",
  "messages": [
    {
      "role": "user",
      "content": "Take a screenshot of the desktop"
    }
  ],
  "stream": false,
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response (Non-streaming):**
```json
{
  "id": "chatcmpl-1234567890",
  "object": "chat.completion",
  "created": 1234567890,
  "model": "claude-3-7-sonnet-20250219",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "I'll take a screenshot of the desktop for you."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 15,
    "total_tokens": 25
  }
}
```

**Streaming Response:**
When `"stream": true` is set, the response will be in Server-Sent Events format:

```
data: {"id":"chatcmpl-1234567890","object":"chat.completion.chunk","created":1234567890,"model":"claude-3-7-sonnet-20250219","choices":[{"index":0,"delta":{"content":"I'll"},"finish_reason":null}]}

data: {"id":"chatcmpl-1234567890","object":"chat.completion.chunk","created":1234567890,"model":"claude-3-7-sonnet-20250219","choices":[{"index":0,"delta":{"content":" take"},"finish_reason":null}]}

data: [DONE]
```

##### List Models
```
GET /api/v1/models
```

**Response:**
```json
{
  "object": "list",
  "data": [
    {
      "id": "claude-3-7-sonnet-20250219",
      "object": "model",
      "created": 1234567890,
      "owned_by": "anthropic",
      "permission": [],
      "root": "claude-3-7-sonnet-20250219",
      "parent": null
    }
  ]
}
```

## Usage Examples

### Python with OpenAI Library
**Local Development:**
```python
import openai

client = openai.OpenAI(
    base_url="http://localhost:3000/api/v1",
    api_key="dummy-key"  # Not required but needed for OpenAI client
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet-20250219",
    messages=[
        {"role": "user", "content": "Take a screenshot and describe what you see"}
    ]
)

print(response.choices[0].message.content)
```

**Production (Vercel):**
```python
import openai

client = openai.OpenAI(
    base_url="https://your-app-name.vercel.app/api/v1",
    api_key="dummy-key"  # Not required but needed for OpenAI client
)

response = client.chat.completions.create(
    model="claude-3-7-sonnet-20250219",
    messages=[
        {"role": "user", "content": "Take a screenshot and describe what you see"}
    ]
)

print(response.choices[0].message.content)
```

### cURL
**Local Development:**
```bash
curl -X POST http://localhost:3000/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "messages": [
      {
        "role": "user",
        "content": "Open a web browser and navigate to google.com"
      }
    ],
    "stream": false
  }'
```

**Production (Vercel):**
```bash
curl -X POST https://your-app-name.vercel.app/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-3-7-sonnet-20250219",
    "messages": [
      {
        "role": "user",
        "content": "Open a web browser and navigate to google.com"
      }
    ],
    "stream": false
  }'
```

### JavaScript/Node.js
**Local Development:**
```javascript
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-7-sonnet-20250219',
    messages: [
      {
        role: 'user',
        content: 'Create a new text file and write "Hello World" in it'
      }
    ],
    stream: false
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

**Production (Vercel):**
```javascript
const response = await fetch('https://your-app-name.vercel.app/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'claude-3-7-sonnet-20250219',
    messages: [
      {
        role: 'user',
        content: 'Create a new text file and write "Hello World" in it'
      }
    ],
    stream: false
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);
```

## Available Tools

The AI has access to two main tools:

1. **Computer Tool**: Can take screenshots, click, type, scroll, and interact with the desktop
2. **Bash Tool**: Can execute shell commands, create files, run programs, etc.

## Features

- **Computer Vision**: Can see and interact with the desktop
- **File Operations**: Create, edit, and manage files
- **Web Browsing**: Open browsers and navigate websites
- **Application Control**: Launch and control desktop applications
- **Command Execution**: Run shell commands and scripts

## Running the Application

### Local Development

1. Install dependencies:
```bash
cd ai-sdk-computer-use-main
npm install
```

2. Set up environment variables (copy `.env.example` to `.env` and configure)

3. Start the development server:
```bash
npm run dev
```

4. Access the web interface at `http://localhost:3000`
5. Use the API at `http://localhost:3000/api/v1`

### Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your repository

3. Configure environment variables in Vercel dashboard:
   - Go to your project settings
   - Add the same environment variables from your `.env` file

4. Deploy:
   - Vercel will automatically deploy on every push to your main branch
   - Your app will be available at `https://your-app-name.vercel.app`
   - API endpoints will be at `https://your-app-name.vercel.app/api/v1`

**Note:** Replace `your-app-name` with your actual Vercel app name in all the examples above.

## CORS Support

The API includes CORS headers to allow cross-origin requests from web applications.
