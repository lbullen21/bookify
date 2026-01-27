import { NextRequest, NextResponse } from 'next/server';

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

interface GoogleBooksItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      thumbnail: string;
      smallThumbnail: string;
    };
    industryIdentifiers?: {
      type: string;
      identifier: string;
    }[];
  };
}

// LLM-powered recommendation system
async function generateLLMBookQueries(artist: {
  name: string;
  genres?: string[];
}): Promise<string[]> {
  const genreInfo =
    artist.genres && artist.genres.length > 0
      ? artist.genres.join(', ')
      : "Unknown (please analyze the artist's general style and musical characteristics)";

  const prompt = `As a literary expert, analyze this musical artist and suggest book search terms:
    
Artist: ${artist.name}
Genres: ${genreInfo}

Based on what you know about this artist's music style, themes, and aesthetic, generate 5-7 specific book search queries that would find books matching their artistic vibe. Include:
- Books that match the mood/themes of their music
- Literary genres that align with their artistic style  
- Specific keywords that capture their aesthetic
- Mix of popular and literary fiction searches
- Consider the artist's cultural impact and fan base

If genre info is limited, use your knowledge of the artist to infer their style and recommend accordingly.

Return only the search queries, one per line.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 250, // Increased for more queries
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status);
      return getFallbackQueries(artist);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (content) {
      return content
        .split('\n')
        .filter((line: string) => line.trim())
        .slice(0, 7); // Increased from 5 to 7
    }

    return getFallbackQueries(artist);
  } catch {
    console.error('Error calling OpenAI');
    return getFallbackQueries(artist);
  }
}

function getFallbackQueries(artist: {
  name: string;
  genres?: string[];
}): string[] {
  const artistGenres = artist.genres?.slice(0, 3) || [];
  const queries: string[] = [];

  // Genre-based searches
  artistGenres.forEach((genre: string) => {
    const lowerGenre = genre.toLowerCase();

    if (lowerGenre.includes('pop')) {
      queries.push('contemporary fiction bestseller', 'romantic drama novel');
    } else if (lowerGenre.includes('rock')) {
      queries.push('literary fiction award', 'dark contemporary novel');
    } else if (lowerGenre.includes('electronic')) {
      queries.push('science fiction cyberpunk', 'futuristic thriller');
    } else if (lowerGenre.includes('jazz')) {
      queries.push('literary fiction sophisticated', 'urban literary novel');
    } else if (lowerGenre.includes('country')) {
      queries.push('southern fiction novel', 'rural literary fiction');
    } else if (lowerGenre.includes('hip hop') || lowerGenre.includes('rap')) {
      queries.push('urban fiction bestseller', 'contemporary social drama');
    } else {
      queries.push('bestseller fiction', 'popular contemporary novel');
    }
  });

  // Always add some general fallback queries to ensure variety
  const generalFallbacks = [
    'contemporary fiction popular',
    'literary fiction award winner',
    'bestselling novel recent',
    'character driven fiction',
    'modern literature acclaimed',
  ];

  queries.push(...generalFallbacks);

  // Remove duplicates and return first 8 queries
  return [...new Set(queries)].slice(0, 8);
}

async function generateLLMBookReason(
  artist: { name: string; genres?: string[] },
  book: BookRecommendation
): Promise<string> {
  const prompt = `Explain why fans of ${artist.name} would enjoy this book, considering their musical style and artistic themes:
    
Book: "${book.title}" by ${book.author}
Genre: ${book.genre}
Book Description: ${book.description}

Write a personalized 1-2 sentence explanation connecting ${artist.name}'s artistic style, themes, or fanbase to this book's content. Be specific about the connection.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 120, // Slightly increased for more detailed explanations
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return `Based on ${artist.name}'s artistic style and themes, this book offers compelling storytelling that resonates with their musical aesthetic.`;
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content?.trim() ||
      `Perfect for ${artist.name} fans who appreciate thoughtful storytelling.`
    );
  } catch {
    return `Based on ${artist.name}'s style, this book offers compelling storytelling.`;
  }
}

async function fetchBooksFromGoogle(
  query: string,
  maxResults: number = 5
): Promise<BookRecommendation[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=${maxResults}&orderBy=relevance&printType=books&langRestrict=en`
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    if (!data.items) {
      return [];
    }

    return data.items.map((item: GoogleBooksItem) => {
      const book = item.volumeInfo;
      const isbn = book.industryIdentifiers?.find(
        id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
      )?.identifier;

      return {
        id: `google-${item.id}`,
        title: book.title,
        author: book.authors ? book.authors[0] : 'Unknown Author',
        description: book.description
          ? book.description.slice(0, 200) + '...'
          : 'A great read.',
        genre: book.categories ? book.categories[0] : 'Fiction',
        reason: '',
        coverUrl: book.imageLinks?.thumbnail || '',
        amazonUrl: isbn
          ? `https://www.amazon.com/s?k=${isbn}`
          : `https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`,
        rating: book.averageRating || 4.0,
      };
    });
  } catch {
    console.error('Error fetching from Google Books');
    return [];
  }
}

export async function POST(request: NextRequest) {
  try {
    const { artist } = await request.json();

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist data is required' },
        { status: 400 }
      );
    }

    const searchQueries = await generateLLMBookQueries(artist);
    const recommendations: BookRecommendation[] = [];
    const usedBooks = new Set<string>();
    const minRecommendations = 5;

    // First pass: try to get 5 recommendations from the first 3 queries
    for (const query of searchQueries.slice(0, 3)) {
      try {
        const googleBooks = await fetchBooksFromGoogle(query, 5); // Increased from 3 to 5

        for (const book of googleBooks) {
          if (
            !usedBooks.has(book.title.toLowerCase()) &&
            recommendations.length < minRecommendations
          ) {
            book.reason = await generateLLMBookReason(artist, book);
            recommendations.push(book);
            usedBooks.add(book.title.toLowerCase());
          }
        }

        if (recommendations.length >= minRecommendations) break;
      } catch {
        console.error(`Error processing query:`);
      }
    }

    // Second pass: if we still don't have enough, try remaining queries
    if (
      recommendations.length < minRecommendations &&
      searchQueries.length > 3
    ) {
      for (const query of searchQueries.slice(3)) {
        try {
          const googleBooks = await fetchBooksFromGoogle(query, 5);

          for (const book of googleBooks) {
            if (
              !usedBooks.has(book.title.toLowerCase()) &&
              recommendations.length < minRecommendations
            ) {
              book.reason = await generateLLMBookReason(artist, book);
              recommendations.push(book);
              usedBooks.add(book.title.toLowerCase());
            }
          }

          if (recommendations.length >= minRecommendations) break;
        } catch {
          console.error(`Error processing additional query:`);
        }
      }
    }

    // Third pass: if still not enough, try broader genre-based searches
    if (recommendations.length < minRecommendations) {
      const fallbackQueries = getFallbackQueries(artist);

      for (const query of fallbackQueries) {
        if (recommendations.length >= minRecommendations) break;

        try {
          const googleBooks = await fetchBooksFromGoogle(query, 10); // More books for fallback

          for (const book of googleBooks) {
            if (
              !usedBooks.has(book.title.toLowerCase()) &&
              recommendations.length < minRecommendations
            ) {
              book.reason = await generateLLMBookReason(artist, book);
              recommendations.push(book);
              usedBooks.add(book.title.toLowerCase());
            }
          }
        } catch {
          console.error(`Error processing fallback query:`);
        }
      }
    }

    return NextResponse.json({
      artist: artist.name,
      genres: artist.genres || [],
      recommendations,
      total_found: recommendations.length,
      generated_at: new Date().toISOString(),
      personalized: true,
      llm_powered: true,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
