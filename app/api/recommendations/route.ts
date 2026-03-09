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

  const prompt = `You are a literary expert for Bookify, a premium book discovery app. Analyze this musical artist deeply and create sophisticated book search queries for thoughtful, non-obvious recommendations.

Artist: ${artist.name}
Musical Genres: ${genreInfo}

Perform a deep thematic analysis considering:
- Emotional atmosphere and mood of their music
- Lyrical themes, storytelling approach, and narrative style
- Cultural context, social commentary, or philosophical undertones
- Aesthetic sensibilities and artistic evolution
- The psychological profile of their fanbase

Generate 6-8 specific search queries for books that match their THEMATIC DEPTH and EMOTIONAL RESONANCE. Focus on:
- Literary fiction that captures similar emotional landscapes
- Contemporary novels with matching atmospheric qualities
- Books that explore parallel themes or philosophical questions
- Stories with similar narrative energy or storytelling techniques
- Works that would appeal to the artist's specific fanbase psychology

Avoid surface-level genre matching. Instead, find books that share:
- Similar emotional complexity
- Parallel artistic sensibilities
- Matching thematic preoccupations
- Comparable storytelling energy

Create search queries that will find unique, thoughtful recommendations. Include specific thematic keywords, mood descriptors, and literary elements rather than just genres.

Return only the search queries, one per line, focusing on thematic depth over popularity metrics.`;

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
        max_tokens: 300,
        temperature: 0.8,
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
        .slice(0, 8);
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
  const artistGenres = artist.genres?.slice(0, 2) || [];
  const queries: string[] = [];

  // Thematically sophisticated fallback searches
  artistGenres.forEach((genre: string) => {
    const lowerGenre = genre.toLowerCase();

    if (lowerGenre.includes('pop')) {
      queries.push(
        'coming of age literary fiction emotional depth',
        'contemporary romance psychological complexity'
      );
    } else if (lowerGenre.includes('rock')) {
      queries.push(
        'literary fiction rebellion counterculture',
        'dark psychological fiction existential themes'
      );
    } else if (lowerGenre.includes('electronic')) {
      queries.push(
        'speculative fiction identity technology',
        'literary science fiction human connection'
      );
    } else if (lowerGenre.includes('jazz')) {
      queries.push(
        'sophisticated literary fiction cultural depth',
        'historical fiction artistic sophistication'
      );
    } else if (lowerGenre.includes('country')) {
      queries.push(
        'literary fiction family heritage place',
        'contemporary fiction small town identity'
      );
    } else if (lowerGenre.includes('hip hop') || lowerGenre.includes('rap')) {
      queries.push(
        'literary fiction social justice identity',
        'contemporary urban fiction authentic voice'
      );
    }
  });

  // Sophisticated thematic fallbacks
  const literaryFallbacks = [
    'literary fiction emotional complexity psychological depth',
    'contemporary fiction character driven narrative',
    'literary debut novel authentic voice',
    'prize winning fiction thematic depth',
    'literary fiction cultural identity belonging',
    'contemporary novel interpersonal relationships',
  ];

  queries.push(...literaryFallbacks);

  return [...new Set(queries)].slice(0, 8);
}

async function generateLLMBookReason(
  artist: { name: string; genres?: string[] },
  book: BookRecommendation
): Promise<string> {
  const prompt = `You are a literary expert for Bookify. Create a sophisticated, specific connection between this artist and book that goes beyond surface-level similarities.

Artist: ${artist.name}
Book: "${book.title}" by ${book.author}
Book Description: ${book.description}
Genre Context: ${book.genre}

Analyze the deeper connections:
- How do the book's emotional themes resonate with the artist's musical atmosphere?
- What specific narrative elements mirror the artist's storytelling approach?
- How might the book's psychological landscape appeal to this artist's fanbase?
- What thematic preoccupations do they share?

Write a compelling 2-3 sentence explanation that reveals a thoughtful, non-obvious connection. Be specific about shared themes, emotional resonance, or artistic sensibilities. Avoid generic statements about "fans will enjoy" - instead focus on WHY there's a meaningful artistic parallel.`;

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
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      return `This book shares ${artist.name}'s exploration of complex emotional landscapes and authentic storytelling.`;
    }

    const data = await response.json();
    return (
      data.choices[0]?.message?.content?.trim() ||
      `The thematic depth and narrative approach align with ${artist.name}'s artistic sensibilities.`
    );
  } catch {
    return `This book resonates with the emotional complexity found in ${artist.name}'s work.`;
  }
}

async function fetchBooksFromGoogle(
  query: string,
  maxResults: number = 5
): Promise<BookRecommendation[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodedQuery}&maxResults=${maxResults}&orderBy=relevance&printType=books&langRestrict=en${keyParam}`
    );

    if (!response.ok) {
      console.error(
        `Google Books API error: ${response.status} for query "${query}"`
      );
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
    const usedBooks = new Set<string>();
    const targetRecommendations = 5;

    // Fetch from first 4 queries in parallel (avoids rate-limiting without API key)
    const queryResults = await Promise.all(
      searchQueries.slice(0, 4).map(q => fetchBooksFromGoogle(q, 6))
    );

    // Flatten, deduplicate, and filter candidates
    const candidates: BookRecommendation[] = [];
    for (const books of queryResults) {
      for (const book of books) {
        if (
          !usedBooks.has(book.title.toLowerCase()) &&
          book.description.length > 20 &&
          book.rating >= 3.0
        ) {
          candidates.push(book);
          usedBooks.add(book.title.toLowerCase());
        }
      }
    }

    // Fallback if not enough candidates
    if (candidates.length < targetRecommendations) {
      const fallbackResults = await Promise.all(
        getFallbackQueries(artist)
          .slice(0, 4)
          .map(q => fetchBooksFromGoogle(q, 8))
      );
      for (const books of fallbackResults) {
        for (const book of books) {
          if (!usedBooks.has(book.title.toLowerCase())) {
            candidates.push(book);
            usedBooks.add(book.title.toLowerCase());
          }
        }
      }
    }

    const recommendations = candidates.slice(0, targetRecommendations);

    // Generate all reasons in parallel
    await Promise.all(
      recommendations.map(async book => {
        book.reason = await generateLLMBookReason(artist, book);
      })
    );

    return NextResponse.json({
      artist: artist.name,
      genres: artist.genres || [],
      recommendations: recommendations.slice(0, targetRecommendations),
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
