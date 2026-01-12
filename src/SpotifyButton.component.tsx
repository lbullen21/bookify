'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

export default function SpotifyButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <button
        disabled
        className="bg-gray-400 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg flex items-center gap-3 mx-auto cursor-not-allowed"
      >
        <svg
          className="w-6 h-6 animate-spin"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
        Loading...
      </button>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <p className="text-green-800 dark:text-green-200 font-medium">
            ✅ Connected to Spotify as {session.user?.name}
          </p>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-full text-sm shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Disconnect Spotify
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('spotify')}
      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-3 mx-auto"
    >
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
      Connect with Spotify
    </button>
  );
}
