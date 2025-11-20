'use client';

import {
  useVoiceAssistant,
  RoomAudioRenderer,
  ControlBar,
} from '@livekit/components-react';
import { Room } from 'livekit-client';
import { useEffect, useState } from 'react';
import { RoomContext } from '@livekit/components-react';

export default function Home() {
  const [roomInstance] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
  }));
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const connectToRoom = async () => {
      try {
        const identity = `user-${Math.random().toString(36).substring(2, 11)}`;
        
        const resp = await fetch(`/api/token?identity=${identity}`);
        const data = await resp.json();
        
        if (!mounted) return;
        
        if (data.error) {
          setError(data.error);
          return;
        }
        
        if (data.token && data.serverUrl) {
          await roomInstance.connect(data.serverUrl, data.token);
          setIsConnected(true);
        }
      } catch (e) {
        if (!mounted) return;
        console.error('Connection error:', e);
        setError(e instanceof Error ? e.message : 'Failed to connect to room');
      }
    };

    connectToRoom();

    return () => {
      mounted = false;
      roomInstance.disconnect();
    };
  }, [roomInstance]);

  if (error) {
    return (
      <main>
        <div className="container">
          <div className="header">
            <h1>LiveKit Voice Agent</h1>
            <p>Voice AI Assistant</p>
          </div>
          <div className="error">
            <strong>Connection Error</strong>
            <div style={{ marginTop: '0.5rem' }}>{error}</div>
          </div>
        </div>
      </main>
    );
  }

  if (!isConnected) {
    return (
      <main>
        <div className="container">
          <div className="header">
            <h1>LiveKit Voice Agent</h1>
            <p>Voice AI Assistant</p>
          </div>
          <div className="loading">
            Establishing connection...
          </div>
        </div>
      </main>
    );
  }

  return (
    <RoomContext.Provider value={roomInstance}>
      <main>
        <div className="container">
          <div className="header">
            <h1>LiveKit Voice Agent</h1>
            <p>Voice AI Assistant</p>
          </div>
          
          <div className="voice-agent-container">
            <AgentVisualizer />
            <RoomAudioRenderer />
            <ControlBar />
          </div>
        </div>
      </main>
    </RoomContext.Provider>
  );
}

function AgentVisualizer() {
  const { state } = useVoiceAssistant();
  
  return (
    <div className="orb-container">
      <Orb state={state} />
      <div className="state-label">
        {state}
      </div>
    </div>
  );
}

interface OrbProps {
  state: string;
}

function Orb({ state }: OrbProps) {
  return (
    <div className={`orb ${state}`}>
      <div className="orb-core">
        <div className="orb-glow" />
      </div>
    </div>
  );
}
