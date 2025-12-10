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
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    const spotifyAPI = createSpotifyAPI(session);
    if (!spotifyAPI) {
      return NextResponse.json(
        { error: 'No Spotify access token' },
        { status: 400 }
      );
    }

    const recentlyPlayed = await spotifyAPI.getRecentlyPlayed(limit);

    return NextResponse.json(recentlyPlayed);
  } catch (error) {
    console.error('Error fetching recently played:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recently played tracks' },
      { status: 500 }
    );
  }
}
