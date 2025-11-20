import { NextRequest, NextResponse } from 'next/server';
import { AccessToken } from 'livekit-server-sdk';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const identity = req.nextUrl.searchParams.get('identity');
    
    if (!identity) {
      return NextResponse.json(
        { error: 'Missing "identity" query parameter' },
        { status: 400 }
      );
    }

    const livekitUrl = process.env.LIVEKIT_URL;
    const livekitApiKey = process.env.LIVEKIT_API_KEY;
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET;

    if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
      return NextResponse.json(
        {
          error:
            'Server misconfigured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET environment variables.',
        },
        { status: 500 }
      );
    }

    // Generate a random room name
    const roomName = `voice-agent-${Math.random().toString(36).substring(2, 11)}`;

    const at = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const token = await at.toJwt();

    return NextResponse.json(
      {
        token,
        serverUrl: livekitUrl,
        room: roomName,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      {
        error:
          'Failed to generate token: ' +
          (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 }
    );
  }
}

