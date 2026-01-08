'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SpotifyArtist, RecentlyPlayedTrack } from '@/lib/spotify';
import BookRecommendations from './BookRecommendations.component';

interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  reason: string;
  coverUrl?: string;
  amazonUrl?: string;
  rating: number;
}

interface RecommendationResponse {
  artist: string;
  genres: string[];
  recommendations: BookRecommendation[];
  generated_at: string;
}

interface ListeningProfile {
  topArtists: SpotifyArtist[];
  recentTracks: RecentlyPlayedTrack[];
  analysis: {
    averageEnergy: number;
    averageDanceability: number;
    averageValence: number;
    averageAcousticness: number;
    averageTempo: number;
    musicProfile: {
      energy: string;
      mood: string;
      danceability: string;
      acoustic: string;
    };
    topArtists: Record<string, number>;
  } | null;
  timeRange: string;
  generatedAt: string;
}

interface Props {
  timeRange?: 'short_term' | 'medium_term' | 'long_term';
}

export default function SpotifyListeningData({
  timeRange = 'medium_term',
}: Props) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ListeningProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Helper function to format dates consistently across server and client
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Helper function to format numbers consistently across server and client
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Function to get book recommendations for an artist
  const getBookRecommendations = async (artist: SpotifyArtist) => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artist }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data: RecommendationResponse = await response.json();
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      // You could add error handling here
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleArtistClick = (e: React.MouseEvent, artist: SpotifyArtist) => {
    e.preventDefault();
    getBookRecommendations(artist);
  };

  const timeRangeLabels = {
    medium_term: 'Last 6 Months',
  };

  const fetchListeningProfile = async (range: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/spotify/listening-profile?timeRange=${range}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch listening data');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching listening profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchListeningProfile(timeRange);
    }
  }, [session, timeRange]);

  if (status === 'loading' || loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 border border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          Error Loading Listening Data
        </h3>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={() => fetchListeningProfile(timeRange)}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }
  console.log('Listening Profile:', profile);

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Your Music Profile
        </h2>
        <div className="flex space-x-2 mb-4">
          {Object.entries(timeRangeLabels).map(([range, label]) => (
            <button
              key={range}
              onClick={() => fetchListeningProfile(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Music Profile Analysis */}
        {profile.analysis && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
              🎵 Your Musical DNA
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile.analysis.musicProfile.energy}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Energy Level
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile.analysis.musicProfile.mood}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Mood</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile.analysis.musicProfile.danceability}
                </div>
                <div className="text-gray-600 dark:text-gray-400">
                  Danceability
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {profile.analysis.musicProfile.acoustic}
                </div>
                <div className="text-gray-600 dark:text-gray-400">Style</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top Artists */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            🎤 Your Top Artists
          </h3>
          <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
            📚 Click for book recommendations
          </div>
        </div>
        <div className="grid gap-4">
          {profile.topArtists.map((artist, index) => (
            <button
              key={artist.id}
              onClick={(e) => handleArtistClick(e, artist)}
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer text-left border border-transparent hover:border-purple-200 dark:hover:border-purple-700"
            >
              <div className="text-lg font-semibold text-gray-500 dark:text-gray-400 w-6">
                {index + 1}
              </div>
              {artist.images[0] && (
                <Image
                  src={artist.images[0].url}
                  alt={artist.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {artist.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {artist.genres.slice(0, 2).join(', ') || 'No genres listed'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {formatNumber(artist.followers.total)} followers
                </p>
              </div>
              <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                📚 Get Book Recs →
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recently Played */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          ⏮️ Recently Played
        </h3>
        <div className="grid gap-3">
          {profile.recentTracks.slice(0, 5).map(item => (
            <a
              key={`${item.track.id}-${item.played_at}`}
              href={item.track.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {item.track.album.images[0] && (
                <Image
                  src={item.track.album.images[0].url}
                  alt={item.track.album.name}
                  width={48}
                  height={48}
                  className="rounded object-cover"
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {item.track.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.track.artists.map(artist => artist.name).join(', ')}
                </p>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-500">
                {formatDate(item.played_at)}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Loading overlay for recommendations */}
      {loadingRecommendations && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-lg font-medium text-gray-900 dark:text-white">
                Finding perfect books for you...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Book Recommendations Modal */}
      {recommendations && (
        <BookRecommendations
          artistName={recommendations.artist}
          recommendations={recommendations.recommendations}
          onClose={() => setRecommendations(null)}
        />
      )}
    </div>
  );
}
