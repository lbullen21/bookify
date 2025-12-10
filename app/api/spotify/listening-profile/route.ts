import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSpotifyAPI, analyzeListeningPatterns } from '@/lib/spotify';

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

    // Fetch user's top tracks and artists
    const [topTracks, topArtists, recentlyPlayed] = await Promise.all([
      spotifyAPI.getTopTracks(timeRange, 50),
      spotifyAPI.getTopArtists(timeRange, 20),
      spotifyAPI.getRecentlyPlayed(50),
    ]);

    // Only get audio features if we have tracks
    let audioFeatures = [];
    let analysis = null;

    if (topTracks && topTracks.length > 0) {
      try {
        const trackIds = topTracks.slice(0, 20).map(track => track.id);
        audioFeatures = await spotifyAPI.getAudioFeatures(trackIds);
        // Only analyze if we have audio features
        if (audioFeatures && audioFeatures.length > 0) {
          analysis = analyzeListeningPatterns(topTracks, audioFeatures);
        }
      } catch (audioError) {
        console.error('Error fetching audio features:', audioError);
        // Continue without audio features
      }
    }

    const profile = {
      topTracks: topTracks?.slice(0, 10) || [],
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
