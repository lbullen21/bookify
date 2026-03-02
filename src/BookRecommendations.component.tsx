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

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <svg
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-slate-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function BookRecommendations({
  artistName,
  recommendations,
  onClose,
}: BookRecommendationsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Book Recommendations
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Based on your taste for{' '}
              <span className="font-medium text-slate-700">{artistName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Book list */}
        <div className="overflow-y-auto flex-1">
          {recommendations.map((book, index) => (
            <div key={book.id} className="border-b border-slate-50 last:border-0">
              {/* Book row */}
              <a
                href={book.amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
              >
                {/* Rank */}
                <span className="text-xs font-medium text-slate-300 w-4 pt-1 text-center shrink-0">
                  {index + 1}
                </span>

                {/* Cover */}
                <div className="w-11 h-16 shrink-0 relative rounded-md overflow-hidden bg-slate-100">
                  {book.coverUrl ? (
                    <Image
                      src={book.coverUrl}
                      alt={`Cover of ${book.title}`}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-slate-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    by {book.author}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                      {book.genre}
                    </span>
                    <StarRating rating={book.rating} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-2">
                    {book.description}
                  </p>
                </div>

                {/* External link icon */}
                <svg
                  className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>

              {/* Why this matches accordion */}
              <div className="px-6 pb-3">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === book.id ? null : book.id)
                  }
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg
                    className={`w-3 h-3 transition-transform ${expandedId === book.id ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  Why this matches your taste
                </button>
                {expandedId === book.id && (
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5">
                    {book.reason}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400">
            Click any book to view on Amazon
          </p>
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
