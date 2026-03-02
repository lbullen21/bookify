'use client';

import { signIn, signOut, useSession } from 'next-auth/react';

const SpotifyIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

export default function SpotifyButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed">
        <svg
          className="w-4 h-4 animate-spin"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
        </svg>
        Loading...
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 text-sm text-slate-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          Connected to Spotify
        </div>
        <button
          onClick={() => signOut()}
          className="text-sm text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn('spotify')}
      className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-[#1DB954] hover:bg-[#17a348] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
    >
      <SpotifyIcon />
      Connect with Spotify
    </button>
  );
}
