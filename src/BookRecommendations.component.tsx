'use client';

import { useState } from 'react';
import Image from 'next/image';

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

interface BookRecommendationsProps {
  artistName: string;
  recommendations: BookRecommendation[];
  onClose: () => void;
}

export default function BookRecommendations({
  artistName,
  recommendations,
  onClose,
}: BookRecommendationsProps) {
  const [selectedBook, setSelectedBook] = useState<BookRecommendation | null>(
    null
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📚 Book Recommendations</h2>
              <p className="text-purple-100 mt-1">
                Based on your love for{' '}
                <span className="font-semibold">{artistName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid gap-6">
            {recommendations.map((book, index) => (
              <div
                key={book.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                {/* Clickable book link to Amazon */}
                <a
                  href={book.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start space-x-4 p-4 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors group"
                >
                  {/* Book Number */}
                  <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>

                  {/* Book Cover */}
                  <div className="w-16 h-20 shrink-0 relative">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={`Cover of ${book.title}`}
                        fill
                        sizes="64px"
                        className="object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📖</span>
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {book.title}
                      </h3>
                      <div className="ml-2 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        🛒
                      </div>
                    </div>
                    <p className="text-purple-600 dark:text-purple-400 font-medium mb-2">
                      by {book.author}
                    </p>
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs font-medium">
                        {book.genre}
                      </span>
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {book.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                      {book.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Click to buy on Amazon →
                      </div>
                      <span className="text-2xl">🛒</span>
                    </div>
                  </div>
                </a>

                {/* Why this matches button */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <button
                    onClick={() =>
                      setSelectedBook(
                        selectedBook?.id === book.id ? null : book
                      )
                    }
                    className="w-full text-left flex items-center justify-between text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                  >
                    <span>🎵 Why this matches your music taste</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${selectedBook?.id === book.id ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* Expanded Reason */}
                  {selectedBook?.id === book.id && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="text-purple-700 dark:text-purple-300 text-sm leading-relaxed">
                          {book.reason}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              📚 Click any book cover to buy on Amazon • 🎵 Click &ldquo;Why
              this matches&rdquo; to see the connection to your music
            </p>
            <button
              onClick={onClose}
              className="bg-linear-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Close Recommendations
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
