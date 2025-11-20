'use client';

import {
  useVoiceAssistant,
  RoomAudioRenderer,
  useTracks,
} from '@livekit/components-react';
import { Room, RoomEvent, Track } from 'livekit-client';
import { useEffect, useState, useCallback } from 'react';
import { RoomContext } from '@livekit/components-react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

export default function Home() {
  const [roomInstance] = useState(() => new Room({
    adaptiveStream: true,
    dynacast: true,
  }));
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    setConnectionState('connecting');
    setError(null);
    
    try {
      const identity = `user-${Math.random().toString(36).substring(2, 11)}`;
      
      const resp = await fetch(`/api/token?identity=${identity}`);
      const data = await resp.json();
      
      if (data.error) {
        setError(data.error);
        setConnectionState('disconnected');
        return;
      }
      
      if (data.token && data.serverUrl) {
        await roomInstance.connect(data.serverUrl, data.token);
        // Auto-enable microphone after connection
        await roomInstance.localParticipant.setMicrophoneEnabled(true);
        setConnectionState('connected');
      }
    } catch (e) {
      console.error('Connection error:', e);
      setError(e instanceof Error ? e.message : 'Failed to connect to room');
      setConnectionState('disconnected');
    }
  }, [roomInstance]);

  const handleDisconnect = useCallback(() => {
    roomInstance.disconnect();
    setConnectionState('disconnected');
  }, [roomInstance]);

  useEffect(() => {
    // Listen for disconnect events
    const onDisconnected = () => {
      setConnectionState('disconnected');
    };

    roomInstance.on(RoomEvent.Disconnected, onDisconnected);

    return () => {
      roomInstance.off(RoomEvent.Disconnected, onDisconnected);
      if (connectionState === 'connected') {
        roomInstance.disconnect();
      }
    };
  }, [roomInstance, connectionState]);

  // Auto-connect on mount
  useEffect(() => {
    handleConnect();
  }, [handleConnect]);

  if (connectionState === 'disconnected') {
    return (
      <main>
        <div className="container">
          <div className="header">
            <h1>My Voice Agent Assistant</h1>
            <p>Personal Assistant powered by LiveKit to manage my tasks, projects, calendar and more.</p>
          </div>
          
          {error && (
            <div className="error">
              <strong>Connection Error</strong>
              <div style={{ marginTop: '0.5rem' }}>{error}</div>
            </div>
          )}
          
          <div className="voice-agent-container" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <button 
              onClick={handleConnect}
              className="connect-button"
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: '0.5rem',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              Connect to Voice Agent
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (connectionState === 'connecting') {
    return (
      <main>
        <div className="container">
          <div className="header">
            <h1>My Voice Agent Assistant</h1>
            <p>Personal Assistant powered by LiveKit to manage my tasks, projects, calendar and more.</p>
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
            <h1>My Voice Agent Assistant</h1>
            <p>Voice AI Assistant</p>
          </div>
          
          <div className="voice-agent-container">
            <AgentVisualizer />
            <RoomAudioRenderer />
            <CustomControls onDisconnect={handleDisconnect} />
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

interface CustomControlsProps {
  onDisconnect: () => void;
}

function CustomControls({ onDisconnect }: CustomControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const micTracks = useTracks([Track.Source.Microphone]);
  
  const handleToggleMicrophone = useCallback(async () => {
    if (micTracks.length > 0) {
      const trackRef = micTracks[0];
      if (trackRef.participant && 'setMicrophoneEnabled' in trackRef.participant) {
        const localParticipant = trackRef.participant as any;
        await localParticipant.setMicrophoneEnabled(!isMuted);
        setIsMuted(!isMuted);
      }
    }
  }, [micTracks, isMuted]);

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      justifyContent: 'center',
      marginTop: '2rem',
    }}>
      <button
        onClick={handleToggleMicrophone}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: '0.5rem',
          border: 'none',
          background: isMuted 
            ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: isMuted
            ? '0 4px 12px rgba(107, 114, 128, 0.3)'
            : '0 4px 12px rgba(102, 126, 234, 0.3)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isMuted
            ? '0 6px 16px rgba(107, 114, 128, 0.4)'
            : '0 6px 16px rgba(102, 126, 234, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isMuted
            ? '0 4px 12px rgba(107, 114, 128, 0.3)'
            : '0 4px 12px rgba(102, 126, 234, 0.3)';
        }}
      >
        {isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
      </button>
      
      <button
        onClick={onDisconnect}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 600,
          borderRadius: '0.5rem',
          border: 'none',
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          color: 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(220, 38, 38, 0.5)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
        }}
      >
        Disconnect
      </button>
    </div>
  );
}
