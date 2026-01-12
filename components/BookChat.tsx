'use client';

import { useState } from 'react';

interface UserProfile {
  topArtists?: Array<{ name: string }>;
  recentTracks?: Array<{
    track: { name: string; artists: Array<{ name: string }> };
  }>;
  genres?: string[];
}

export default function BookChat({
  userProfile,
}: {
  userProfile?: UserProfile;
}) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message.trim(),
          userProfile,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setResponse(`Error: ${data.error}`);
      } else {
        setResponse(data.response);
      }
    } catch {
      setResponse('Sorry, something went wrong. Please try again!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Ask for Book Recommendations
      </h2>

      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Ask me anything about books! (e.g., 'I love Taylor Swift, what books would I enjoy?')"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Ask'}
          </button>
        </div>

        {response && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-gray-800 leading-relaxed">{response}</p>
          </div>
        )}

        <div className="text-sm text-gray-500">
          💡 <strong>Try asking:</strong> &ldquo;What books match my music
          taste?&rdquo;, &ldquo;I love indie rock, any book suggestions?&rdquo;,
          &ldquo;Books for someone who listens to jazz?&rdquo;
        </div>
      </div>
    </div>
  );
}
