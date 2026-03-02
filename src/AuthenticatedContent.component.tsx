'use client';

import { useSession } from 'next-auth/react';
import SpotifyButton from './SpotifyButton.component';
import SpotifyListeningData from './SpotifyListeningData.component';

const features = [
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
      </svg>
    ),
    title: 'Connect Your Music',
    description:
      'Link your Spotify account to analyze your listening patterns and favorite artists across recent months.',
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
        />
      </svg>
    ),
    title: 'AI-Powered Matching',
    description:
      'Our model maps your music taste — genre, energy, mood — to literary styles and themes that resonate.',
  },
  {
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    title: 'Curated Picks',
    description:
      'Receive personalized book recommendations that match the mood and vibe of what you actually listen to.',
  },
];

export default function AuthenticatedContent() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-10">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-slate-100 rounded w-1/2" />
            <div className="h-4 bg-slate-100 rounded w-3/4" />
            <div className="h-10 bg-slate-100 rounded w-44 mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-10">
        {/* Hero */}
        <div className="max-w-xl mx-auto text-center pt-10">
          <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-3">
            Music-powered book discovery
          </h1>
          <p className="text-base text-slate-500 leading-relaxed mb-8 max-w-md mx-auto">
            Connect your Spotify account and get book recommendations matched to
            the mood, genre, and energy of your favorite music.
          </p>
          <SpotifyButton />
        </div>

        {/* Feature cards */}
        <div className="grid md:grid-cols-3 gap-4 pt-2">
          {features.map(feature => (
            <div
              key={feature.title}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return <SpotifyListeningData />;
}
