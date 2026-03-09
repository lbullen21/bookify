import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSpotifyAPI, SpotifyArtist } from '@/lib/spotify';

function deriveAnalysisFromArtists(topArtists: SpotifyArtist[]) {
  const genreCounts: Record<string, number> = {};
  topArtists.forEach(artist => {
    artist.genres.forEach(genre => {
      genreCounts[genre] = (genreCounts[genre] || 0) + 1;
    });
  });

  const topGenres = Object.keys(genreCounts)
    .sort((a, b) => genreCounts[b] - genreCounts[a])
    .slice(0, 10)
    .join(' ');

  const isHighEnergy =
    /metal|punk|rock|edm|dance|electronic|drum.?bass|techno|house|trap|drill/.test(
      topGenres
    );
  const isLowEnergy =
    /acoustic|folk|ambient|classical|sleep|calm|chill|indie.?folk/.test(
      topGenres
    );

  const isPositive =
    /pop|funk|soul|reggae|latin|dancehall|disco/.test(topGenres);
  const isMelancholic =
    /sad|emo|blues|dark|doom|goth|shoegaze/.test(topGenres);

  const isDanceable =
    /dance|hip.?hop|rap|pop|funk|r.?b|reggaeton|latin|edm|house|disco/.test(
      topGenres
    );
  const isNotDanceable =
    /classical|ambient|folk|metal|post.?rock/.test(topGenres);

  const isAcoustic =
    /acoustic|folk|classical|country|singer.?songwriter|bluegrass/.test(
      topGenres
    );

  return {
    averageEnergy: isHighEnergy ? 0.8 : isLowEnergy ? 0.2 : 0.5,
    averageDanceability: isDanceable ? 0.8 : isNotDanceable ? 0.2 : 0.5,
    averageValence: isPositive ? 0.8 : isMelancholic ? 0.2 : 0.5,
    averageAcousticness: isAcoustic ? 0.7 : 0.3,
    averageTempo: 120,
    musicProfile: {
      energy: isHighEnergy
        ? 'High Energy'
        : isLowEnergy
          ? 'Low Energy'
          : 'Moderate Energy',
      mood: isPositive ? 'Positive' : isMelancholic ? 'Melancholic' : 'Neutral',
      danceability: isDanceable
        ? 'Very Danceable'
        : isNotDanceable
          ? 'Not Danceable'
          : 'Somewhat Danceable',
      acoustic: isAcoustic ? 'Acoustic' : 'Electronic / Produced',
    },
    topArtists: topArtists.reduce(
      (acc: Record<string, number>, artist) => {
        acc[artist.name] = artist.popularity;
        return acc;
      },
      {}
    ),
  };
}

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
        {
          error: 'Spotify authentication required',
          code: 'AUTH_REQUIRED',
          message: 'Please reconnect your Spotify account',
        },
        { status: 401 }
      );
    }

    const [topArtists, recentlyPlayed] = await Promise.all([
      spotifyAPI.getTopArtists(timeRange, 10),
      spotifyAPI.getRecentlyPlayed(10),
    ]);

    const artists = topArtists || [];
    const analysis =
      artists.length > 0 ? deriveAnalysisFromArtists(artists) : null;

    const profile = {
      topArtists: artists,
      recentTracks: recentlyPlayed || [],
      analysis,
      timeRange,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating listening profile:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('401') || errorMessage.includes('expired')) {
      return NextResponse.json(
        {
          error: 'Spotify authentication expired',
          code: 'TOKEN_EXPIRED',
          message: 'Please reconnect your Spotify account',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create listening profile' },
      { status: 500 }
    );
  }
}
