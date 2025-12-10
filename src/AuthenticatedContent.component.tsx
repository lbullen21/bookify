'use client';

import { useSession } from 'next-auth/react';
import SpotifyButton from './SpotifyButton.component';
import SpotifyListeningData from './SpotifyListeningData.component';

export default function AuthenticatedContent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="max-w-4xl mx-auto text-center mb-16">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-6"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-4xl font-semibold text-gray-900 dark:text-white mb-6">
              Music Meets Literature
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Connect your Spotify account and let us recommend books that match
              the mood, genre, and energy of your favorite music. From indie
              folk to electronic beats, we&apos;ll find the perfect literary
              companion for your soundtrack.
            </p>

            {/* Spotify Login Button */}
            <SpotifyButton />
          </div>
        </section>

        {/* Features Preview */}
        <section className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Connect Your Music
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Link your Spotify account to analyze your listening patterns and
                preferences
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Analysis
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our algorithm matches your music taste with literary genres and
                themes
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="text-4xl mb-4">📖</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Perfect Matches
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Receive personalized book recommendations that resonate with
                your vibe
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  // User is authenticated - show their listening data
  return (
    <section className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-4">
          Welcome back, {session.user?.name}! 🎵
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          Let&apos;s analyze your music taste to find perfect book
          recommendations
        </p>
        <SpotifyButton />
      </div>

      <SpotifyListeningData />
    </section>
  );
}
