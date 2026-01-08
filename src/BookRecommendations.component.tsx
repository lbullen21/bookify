'use client';

import { useState } from 'react';

interface BookRecommendation {
  id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  reason: string;
  coverUrl?: string;
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
  onClose 
}: BookRecommendationsProps) {
  const [selectedBook, setSelectedBook] = useState<BookRecommendation | null>(null);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📚 Book Recommendations</h2>
              <p className="text-purple-100 mt-1">
                Based on your love for <span className="font-semibold">{artistName}</span>
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
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedBook(selectedBook?.id === book.id ? null : book)}
              >
                <div className="flex items-start space-x-4">
                  {/* Book Number */}
                  <div className="bg-linear-to-r from-purple-500 to-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shrink-0">
                    {index + 1}
                  </div>

                  {/* Book Cover Placeholder */}
                  <div className="w-16 h-20 bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center shrink-0">
                    <span className="text-2xl">📖</span>
                  </div>

                  {/* Book Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {book.title}
                    </h3>
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
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {book.description}
                    </p>
                  </div>

                  {/* Expand Icon */}
                  <div className="shrink-0 text-gray-400">
                    <svg 
                      className={`w-5 h-5 transition-transform ${selectedBook?.id === book.id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Reason */}
                {selectedBook?.id === book.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">
                        🎵 Why this matches your music taste:
                      </h4>
                      <p className="text-purple-700 dark:text-purple-300 text-sm leading-relaxed">
                        {book.reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Click on any book to learn why it matches your music taste!
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