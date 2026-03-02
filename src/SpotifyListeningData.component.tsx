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
  const [recommendations, setRecommendations] =
    useState<RecommendationResponse | null>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const getBookRecommendations = async (artist: SpotifyArtist) => {
    setLoadingRecommendations(true);
    try {
      console.log('Sending artist data:', artist);

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ artist }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }

      const data: RecommendationResponse = await response.json();
      console.log('Received recommendations:', data);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const getTrackRecommendations = async (
    track: RecentlyPlayedTrack['track']
  ) => {
    const primaryArtist = track.artists[0];
    const artistForRecommendation: SpotifyArtist = {
      id: primaryArtist.id,
      name: primaryArtist.name,
      genres: [],
      images: [],
      popularity: 0,
      external_urls: { spotify: '' },
      followers: { total: 0 },
    };

    await getBookRecommendations(artistForRecommendation);
  };

  const handleArtistClick = (e: React.MouseEvent, artist: SpotifyArtist) => {
    e.preventDefault();
    getBookRecommendations(artist);
  };

  const handleTrackClick = (
    e: React.MouseEvent,
    track: RecentlyPlayedTrack['track']
  ) => {
    e.preventDefault();
    e.stopPropagation();
    getTrackRecommendations(track);
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

      if (response.status === 401) {
        const errorData = await response.json();
        if (
          errorData.code === 'TOKEN_EXPIRED' ||
          errorData.code === 'AUTH_REQUIRED'
        ) {
          setError(
            'Your Spotify session has expired. Please reconnect your account below.'
          );
          return;
        }
      }

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
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-slate-100 animate-pulse">
              <div className="h-3 bg-slate-100 rounded w-16 mb-1.5" />
              <div className="h-5 bg-slate-100 rounded w-32" />
            </div>
            <div className="divide-y divide-slate-50">
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="flex items-center gap-4 px-6 py-3.5 animate-pulse"
                >
                  <div className="w-10 h-10 bg-slate-100 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    const isTokenError =
      error.includes('expired') || error.includes('reconnect');

    return (
      <div className="bg-white border border-red-200 rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-semibold text-red-700 mb-1">
          {isTokenError ? 'Session expired' : 'Failed to load data'}
        </h3>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <div className="flex gap-2">
          {isTokenError && (
            <button
              onClick={() =>
                (window.location.href = '/api/auth/signin/spotify')
              }
              className="inline-flex items-center gap-2 text-sm px-3 py-1.5 bg-[#1DB954] hover:bg-[#17a348] text-white rounded-md transition-colors font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Reconnect Spotify
            </button>
          )}
          <button
            onClick={() => fetchListeningProfile(timeRange)}
            className="text-sm px-3 py-1.5 bg-slate-900 hover:bg-slate-700 text-white rounded-md transition-colors font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }
  console.log('Listening Profile:', profile);

  return (
    <div className="space-y-4">
      {/* Music Profile */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Overview
            </p>
            <h2 className="text-base font-semibold text-slate-900 mt-0.5">
              Music Profile
            </h2>
          </div>
          <div className="flex gap-1.5">
            {Object.entries(timeRangeLabels).map(([range, label]) => (
              <button
                key={range}
                onClick={() => fetchListeningProfile(range)}
                className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {profile.analysis && (
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
            {[
              { label: 'Energy', value: profile.analysis.musicProfile.energy },
              { label: 'Mood', value: profile.analysis.musicProfile.mood },
              {
                label: 'Danceability',
                value: profile.analysis.musicProfile.danceability,
              },
              {
                label: 'Style',
                value: profile.analysis.musicProfile.acoustic,
              },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 py-5 text-center">
                <p className="text-sm font-semibold text-indigo-600">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Top Artists */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Listening
            </p>
            <h2 className="text-base font-semibold text-slate-900 mt-0.5">
              Top Artists
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any artist for book picks
          </span>
        </div>
        <div className="divide-y divide-slate-50">
          {profile.topArtists.map((artist, index) => (
            <button
              key={artist.id}
              onClick={e => handleArtistClick(e, artist)}
              className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors text-left group"
            >
              <span className="text-xs font-medium text-slate-300 w-5 text-center shrink-0">
                {index + 1}
              </span>
              {artist.images[0] ? (
                <Image
                  src={artist.images[0].url}
                  alt={artist.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {artist.name}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {artist.genres.slice(0, 2).join(', ') || 'Artist'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-slate-400">
                  {formatNumber(artist.followers.total)} followers
                </p>
                <p className="text-xs text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                  Get book recs →
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Recently Played */}
      <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
            History
          </p>
          <h2 className="text-base font-semibold text-slate-900 mt-0.5">
            Recently Played
          </h2>
        </div>
        <div className="divide-y divide-slate-50">
          {profile.recentTracks.slice(0, 5).map(item => (
            <div
              key={`${item.track.id}-${item.played_at}`}
              className="flex items-center gap-4 px-6 py-3.5"
            >
              {item.track.album.images[0] && (
                <Image
                  src={item.track.album.images[0].url}
                  alt={item.track.album.name}
                  width={40}
                  height={40}
                  className="rounded object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <button
                  onClick={e => handleTrackClick(e, item.track)}
                  className="text-left w-full group"
                  title={`Get book recommendations for ${item.track.artists[0].name}`}
                >
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                    {item.track.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {item.track.artists.map(a => a.name).join(', ')}
                    <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                      → book recs
                    </span>
                  </p>
                </button>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <p className="text-xs text-slate-400">
                  {formatDate(item.played_at)}
                </p>
                <a
                  href={item.track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#1DB954] hover:underline block"
                  onClick={e => e.stopPropagation()}
                >
                  Spotify
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Loading overlay for recommendations */}
      {loadingRecommendations && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-2xl flex items-center gap-4">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-slate-200 border-t-indigo-600" />
            <span className="text-sm font-medium text-slate-700">
              Finding perfect books...
            </span>
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
