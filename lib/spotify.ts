// Spotify API utility functions
import { Session } from 'next-auth';

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string; id: string }[];
  album: {
    name: string;
    images: { url: string; width: number; height: number }[];
  };
  duration_ms: number;
  external_urls: { spotify: string };
  popularity: number;
}

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  images: { url: string; width: number; height: number }[];
  popularity: number;
  external_urls: { spotify: string };
  followers: { total: number };
}

interface RecentlyPlayedTrack {
  track: SpotifyTrack;
  played_at: string;
  context: {
    type: string;
    href: string;
    external_urls: { spotify: string };
  } | null;
}

interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string; width: number; height: number }[];
  tracks: { total: number };
  external_urls: { spotify: string };
  public: boolean;
}

interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; width: number; height: number }[];
  followers: { total: number };
  country: string;
  product: string;
}

interface AudioFeatures {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
}

class SpotifyAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async fetchFromSpotify(endpoint: string) {
    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Spotify API error ${response.status} for ${endpoint}:`,
        errorText
      );
      throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get user's top tracks
  async getTopTracks(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit = 20
  ): Promise<SpotifyTrack[]> {
    const data = await this.fetchFromSpotify(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
    return data.items;
  }

  // Get user's top artists
  async getTopArtists(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit = 20
  ): Promise<SpotifyArtist[]> {
    const data = await this.fetchFromSpotify(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
    return data.items;
  }

  // Get recently played tracks
  async getRecentlyPlayed(limit = 20): Promise<RecentlyPlayedTrack[]> {
    const data = await this.fetchFromSpotify(
      `/me/player/recently-played?limit=${limit}`
    );
    return data.items;
  }

  // Get audio features for tracks (useful for music analysis)
  async getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
    const ids = trackIds.join(',');
    const data = await this.fetchFromSpotify(`/audio-features?ids=${ids}`);
    return data.audio_features;
  }

  // Get user's saved tracks
  async getSavedTracks(
    limit = 20,
    offset = 0
  ): Promise<{ track: SpotifyTrack; added_at: string }[]> {
    const data = await this.fetchFromSpotify(
      `/me/tracks?limit=${limit}&offset=${offset}`
    );
    return data.items;
  }

  // Get user's playlists
  async getUserPlaylists(limit = 20): Promise<SpotifyPlaylist[]> {
    const data = await this.fetchFromSpotify(`/me/playlists?limit=${limit}`);
    return data.items;
  }

  // Get current user's profile
  async getCurrentUser(): Promise<SpotifyUser> {
    return this.fetchFromSpotify('/me');
  }
}

// Helper function to create SpotifyAPI instance from session
export function createSpotifyAPI(session: Session): SpotifyAPI | null {
  if (!session.accessToken) {
    console.error('No access token in session');
    return null;
  }

  // Check if token is expired
  if (
    session.accessTokenExpires &&
    Date.now() > session.accessTokenExpires * 1000
  ) {
    console.error('Access token has expired');
    return null;
  }

  // Check if there's a refresh error
  if (session.error === 'RefreshAccessTokenError') {
    console.error('Token refresh failed, user needs to re-authenticate');
    return null;
  }

  return new SpotifyAPI(session.accessToken);
}

// Helper function to analyze listening patterns
export function analyzeListeningPatterns(
  tracks: SpotifyTrack[],
  audioFeatures: AudioFeatures[]
) {
  if (tracks.length === 0 || audioFeatures.length === 0) {
    return null;
  }

  const features = audioFeatures.filter(f => f !== null);

  const analysis = {
    averageEnergy:
      features.reduce((sum, f) => sum + f.energy, 0) / features.length,
    averageDanceability:
      features.reduce((sum, f) => sum + f.danceability, 0) / features.length,
    averageValence:
      features.reduce((sum, f) => sum + f.valence, 0) / features.length,
    averageAcousticness:
      features.reduce((sum, f) => sum + f.acousticness, 0) / features.length,
    averageTempo:
      features.reduce((sum, f) => sum + f.tempo, 0) / features.length,

    // Extract genres from tracks (simplified - would need artist details for full genres)
    topGenres: {}, // Placeholder for genre analysis

    // Get most common artists
    topArtists: tracks.reduce((artists: Record<string, number>, track) => {
      track.artists.forEach(artist => {
        artists[artist.name] = (artists[artist.name] || 0) + 1;
      });
      return artists;
    }, {}),
  };

  return {
    ...analysis,
    musicProfile: {
      energy:
        analysis.averageEnergy > 0.7
          ? 'High Energy'
          : analysis.averageEnergy > 0.4
            ? 'Moderate Energy'
            : 'Low Energy',
      mood:
        analysis.averageValence > 0.7
          ? 'Positive'
          : analysis.averageValence > 0.4
            ? 'Neutral'
            : 'Melancholic',
      danceability:
        analysis.averageDanceability > 0.7
          ? 'Very Danceable'
          : analysis.averageDanceability > 0.4
            ? 'Somewhat Danceable'
            : 'Not Danceable',
      acoustic:
        analysis.averageAcousticness > 0.5 ? 'Acoustic' : 'Electronic/Produced',
    },
  };
}

export type {
  SpotifyTrack,
  SpotifyArtist,
  RecentlyPlayedTrack,
  AudioFeatures,
  SpotifyPlaylist,
  SpotifyUser,
};
