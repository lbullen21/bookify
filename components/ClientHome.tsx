'use client';

import { useEffect, useState } from 'react';
import AuthenticatedContent from '@/src/AuthenticatedContent.component';

export default function ClientHome() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
        <main className="container mx-auto px-6 py-16">
          <header className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              📚 Bookify
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover your next great read based on your Spotify listening
              habits
            </p>
          </header>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-6"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <main className="container mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            📚 Bookify
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover your next great read based on your Spotify listening habits
          </p>
        </header>

        {/* Authenticated Content */}
        <AuthenticatedContent />

        {/* Footer */}
        <footer className="text-center mt-20 text-gray-500 dark:text-gray-400">
          <p>
            Ready to discover your next favorite book? Start by connecting your
            Spotify account above.
          </p>
        </footer>
      </main>
    </div>
  );
}
