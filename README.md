# LiveKit Voice Agent

A proof of concept of a LiveKit voice agent that can use tools to answer questions and perform tasks.

## 🏗️ Architecture

This project is a monorepo that consists of two main applications:

- **Backend** (`/backend`): Node.js + TypeScript voice agent powered by LiveKit Agents SDK
  - Uses STT-LLM-TTS pipeline.
  - Includes VAD (Voice Activity Detection), turn detection, and noise cancellation.
  - Connects to LiveKit Cloud to handle voice interactions.

- **Frontend** (`/frontend`): Next.js 15 + React 19 web application
  - Voice assistant interface with real-time audio visualization.
  - Token generation API for secure LiveKit authentication.
  - Responsive design with modern UI components.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 20.0.0
- **pnpm** >= 10.15.0
- **LiveKit Cloud account**

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd voice-agent-poc

# Install dependencies for all packages
pnpm install
```

### 2. Configure Environment Variables

Each application (backend and frontend) has its own `.env.local` file.

**Quick Setup (Recommended):**
```bash
./setup-env.sh
```

**Manual Setup:**

Backend Configuration:
```bash
cd backend
cp .env.example .env.local
# Edit backend/.env.local and add your LiveKit credentials
```

Frontend Configuration:
```bash
cd frontend
cp .env.example .env.local
# Edit frontend/.env.local and add your LiveKit credentials
```

**Environment Variables:**

Both `backend/.env.local` and `frontend/.env.local` need:
```env
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
```

Additionally, `frontend/.env.local` needs:
```env
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```
(This must match `LIVEKIT_URL` - the `NEXT_PUBLIC_` prefix makes it accessible in the browser)

#### How to Get LiveKit Credentials

1. Go to [LiveKit Cloud](https://cloud.livekit.io) and sign up for a free account
2. Create a new project or select an existing one
3. Navigate to **Settings** → **API Keys**
4. Click **Create New Key** if you don't have one
5. Copy your **API Key** and **API Secret** (save the secret securely!)
6. Find your **Server URL** in the project settings (format: `wss://your-project.livekit.cloud`)

### 3. Download Model Files (Backend)

The backend requires downloading AI model files for VAD and other features:

```bash
pnpm backend:download-files
```

This command downloads the necessary model files (~50MB) for:
- Silero VAD (Voice Activity Detection)
- Turn detection models
- Noise cancellation models

### 4. Run the Applications

You can run both applications simultaneously or separately:

#### Run Both (Recommended for Development)

```bash
pnpm dev
```

This starts both the backend and frontend in parallel:
- Backend: Agent server connects to LiveKit Cloud
- Frontend: http://localhost:3000

#### Run Separately

**Backend only:**
```bash
pnpm backend:dev
```

**Frontend only:**
```bash
pnpm frontend:dev
```

## 🎯 Testing Your Voice Agent

1. Open http://localhost:3000 in your browser
2. Click "Allow" when prompted for microphone access
3. The voice agent will greet you automatically
4. Start speaking to interact with the AI assistant

## 📁 Project Structure

```
voice-agent-poc/
├── package.json              # Root workspace configuration
├── pnpm-workspace.yaml       # PNPM workspace definition
├── backend/                  # Voice agent backend
│   ├── agent.ts             # Main agent implementation
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── .env.example         # Backend environment template
│   └── .env.local           # Backend environment variables (gitignored)
└── frontend/                # Next.js frontend
    ├── app/
    │   ├── api/token/       # Token generation endpoint
    │   │   └── route.ts
    │   ├── layout.tsx       # Root layout
    │   ├── page.tsx         # Main page with voice UI
    │   └── globals.css      # Global styles
    ├── package.json         # Frontend dependencies
    ├── tsconfig.json        # TypeScript configuration
    ├── next.config.ts       # Next.js configuration
    ├── .env.example         # Frontend environment template
    └── .env.local           # Frontend environment variables (gitignored)
```

## 🛠️ Available Scripts

### Root Level

- `pnpm dev` - Run both backend and frontend in development mode
- `pnpm build` - Build both applications for production
- `pnpm backend:dev` - Run backend in development mode
- `pnpm backend:build` - Build backend for production
- `pnpm backend:start` - Start backend in production mode
- `pnpm backend:download-files` - Download required model files
- `pnpm frontend:dev` - Run frontend in development mode
- `pnpm frontend:build` - Build frontend for production
- `pnpm frontend:start` - Start frontend in production mode

### Backend Specific

```bash
cd backend
pnpm dev              # Development mode with hot reload
pnpm build            # Compile TypeScript to JavaScript
pnpm start            # Production mode
pnpm download-files   # Download AI model files
```

### Frontend Specific

```bash
cd frontend
pnpm dev              # Development server (localhost:3000)
pnpm build            # Production build
pnpm start            # Serve production build
pnpm lint             # Run ESLint
```

## 🔧 Configuration

### Backend Agent Configuration

The voice agent uses the following AI models (configured in `backend/agent.ts`):

- **STT**: AssemblyAI Universal-Streaming (English)
- **LLM**: OpenAI GPT-4.1 mini
- **TTS**: Cartesia Sonic-3
- **VAD**: Silero VAD
- **Turn Detection**: Multilingual Model
- **Noise Cancellation**: Background Voice Cancellation

You can modify these in `backend/agent.ts` to use different providers or models. See the [LiveKit Agents documentation](https://docs.livekit.io/agents/models) for available options.

### Frontend Configuration

The frontend uses LiveKit React Components for:
- Audio visualization (BarVisualizer)
- Voice assistant state management (useVoiceAssistant)
- Room audio rendering (RoomAudioRenderer)
- User controls (ControlBar)

Customize the UI in `frontend/app/page.tsx` and styles in `frontend/app/globals.css`.

## 🌐 How It Works

1. **User opens frontend** → Browser loads the Next.js application
2. **Token request** → Frontend calls `/api/token` to get a LiveKit access token
3. **Room connection** → Frontend connects to LiveKit room using the token
4. **Agent dispatch** → Backend agent joins the same room automatically
5. **Voice interaction** → User speaks → STT → LLM → TTS → User hears response
6. **Real-time updates** → Audio visualizer shows agent state (listening, thinking, speaking)

## 📚 Learn More

- [LiveKit Agents Documentation](https://docs.livekit.io/agents)
- [LiveKit React Components](https://docs.livekit.io/reference/components/react)
- [Next.js Documentation](https://nextjs.org/docs)
- [LiveKit Cloud](https://cloud.livekit.io)

## 🐛 Troubleshooting

### Backend won't start

- Ensure you've run `pnpm backend:download-files` to download model files
- Check that `backend/.env.local` has valid LiveKit credentials
- Make sure Node.js version is >= 20.0.0

### Frontend can't connect

- Verify `NEXT_PUBLIC_LIVEKIT_URL` is set correctly in `frontend/.env.local`
- Ensure all required variables are set in `frontend/.env.local` (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET, NEXT_PUBLIC_LIVEKIT_URL)
- Ensure backend is running (`pnpm backend:dev`)
- Check browser console for detailed error messages

### Microphone not working

- Grant microphone permissions when prompted by the browser
- Check browser settings to ensure microphone access is allowed
- Try using HTTPS or localhost (some browsers require secure context)

### Agent not responding

- Check that the backend agent is connected to LiveKit Cloud
- Verify your LiveKit API credentials are correct
- Look at backend logs for any error messages

## 📝 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---
