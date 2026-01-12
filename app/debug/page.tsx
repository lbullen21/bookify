'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import ClientOnly from '@/components/ClientOnly';

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  const checkSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/session');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  const testSpotifyAPI = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/spotify/listening-profile?timeRange=medium_term');
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
    setLoading(false);
  };

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-3xl font-bold mb-8">🔍 Debug Information</h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">NextAuth Session</h2>
            <div className="space-y-2">
              <p><strong>Status:</strong> {status}</p>
              <p><strong>User:</strong> {session?.user?.name || 'None'}</p>
              <p><strong>Email:</strong> {session?.user?.email || 'None'}</p>
              <p><strong>Has Access Token:</strong> {session?.accessToken ? 'Yes' : 'No'}</p>
              <p><strong>Token Expires:</strong> {session?.accessTokenExpires ? new Date(session.accessTokenExpires * 1000).toLocaleString() : 'Unknown'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">API Tests</h2>
            <div className="space-x-4 mb-4">
              <button
                onClick={checkSession}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                Test Session API
              </button>
              <button
                onClick={testSpotifyAPI}
                disabled={loading || !session}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
              >
                Test Spotify API
              </button>
            </div>
            
            {loading && <p className="text-gray-500">Loading...</p>}
            
            {debugInfo && (
              <div className="bg-gray-100 rounded p-4 mt-4">
                <h3 className="font-semibold mb-2">API Response:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Check</h2>
            <div className="space-y-2">
              <p><strong>NEXTAUTH_URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Server-side'}</p>
              <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Server-side'}</p>
            </div>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}