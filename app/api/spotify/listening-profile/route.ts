import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSpotifyAPI } from '@/lib/spotify';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const timeRange =
    (searchParams.get('timeRange') as
      | 'short_term'
      | 'medium_term'
      | 'long_term') || 'medium_term';

  try {
    const spotifyAPI = createSpotifyAPI(session);
    if (!spotifyAPI) {
      return NextResponse.json(
        { error: 'No Spotify access token' },
        { status: 400 }
      );
    }

    // Fetch user's top artists and recently played
    const [topArtists, recentlyPlayed] = await Promise.all([
      spotifyAPI.getTopArtists(timeRange, 20),
      spotifyAPI.getRecentlyPlayed(50),
    ]);

    // No audio features analysis needed since we're not showing track analysis
    const analysis = null;

    const profile = {
      topArtists: topArtists?.slice(0, 10) || [],
      recentTracks: recentlyPlayed?.slice(0, 10) || [],
      analysis,
      timeRange,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating listening profile:', error);
    return NextResponse.json(
      { error: 'Failed to create listening profile' },
      { status: 500 }
    );
  }
}
