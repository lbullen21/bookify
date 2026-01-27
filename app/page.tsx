import { Suspense } from 'react';
import ClientWrapper from '@/components/ClientWrapper';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-green-50">
      <main className="max-w-7xl mx-auto px-6 py-16">
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">📚 Bookify</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Discover your next great read based on your Spotify listening habits
          </p>
        </header>
        <div className="max-w-4xl mx-auto mb-16 text-center">
          <div className="bg-white/80 rounded-2xl p-12 shadow-2xl">
            <div className="animate-pulse">
              Loading your music-powered book recommendations...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ClientWrapper />
    </Suspense>
  );
}
