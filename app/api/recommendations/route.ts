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
    imageLinks?: { thumbnail: string };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

// Ask the LLM to name 5 specific books tailored to this exact artist,
// including the reason for each. One call replaces the old query-generation
// + per-book reason calls.
async function getLLMRecommendations(artist: {
  name: string;
  genres?: string[];
}): Promise<Array<{ title: string; author: string; reason: string }>> {
  const genreInfo =
    artist.genres && artist.genres.length > 0
      ? artist.genres.join(', ')
      : 'unknown genres';

  const prompt = `You are a literary expert for Bookify. Recommend exactly 5 specific books for fans of the musical artist "${artist.name}" (genres: ${genreInfo}).

Choose books that genuinely match THIS artist's specific themes, emotional atmosphere, lyrical sensibility, and fanbase — not generic recommendations that could apply to any artist.

Return ONLY a valid JSON object in this exact format, with no other text:
{
  "books": [
    {
      "title": "Exact Book Title",
      "author": "Author Full Name",
      "reason": "2-3 sentences explaining the specific thematic or emotional connection to ${artist.name}"
    }
  ]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error('No content from OpenAI');

  const parsed = JSON.parse(content);
  const books = parsed.books || parsed.recommendations || [];
  return books.slice(0, 5);
}

// Look up a specific book by title + author to get cover, rating, description.
async function fetchBookMetadata(
  title: string,
  author: string
): Promise<Partial<BookRecommendation>> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    const keyParam = apiKey ? `&key=${apiKey}` : '';
    const query = encodeURIComponent(`intitle:${title} inauthor:${author}`);
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1${keyParam}`
    );

    if (!response.ok) {
      console.error(`Google Books metadata error: ${response.status} for "${title}"`);
      return {};
    }

    const data = await response.json();
    const item: GoogleBooksItem = data.items?.[0];
    if (!item) return {};

    const book = item.volumeInfo;
    const isbn = book.industryIdentifiers?.find(
      id => id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier;

    return {
      id: `google-${item.id}`,
      description: book.description
        ? book.description.slice(0, 200) + '...'
        : '',
      genre: book.categories?.[0] || 'Fiction',
      coverUrl: book.imageLinks?.thumbnail || '',
      amazonUrl: isbn
        ? `https://www.amazon.com/s?k=${isbn}`
        : `https://www.amazon.com/s?k=${encodeURIComponent(title)}`,
      rating: book.averageRating || 4.0,
    };
  } catch {
    console.error(`Error fetching metadata for "${title}"`);
    return {};
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

    // Single LLM call: get 5 artist-specific books with reasons
    const llmBooks = await getLLMRecommendations(artist);

    if (llmBooks.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    // Fetch Google Books metadata for all 5 in parallel
    const metadataResults = await Promise.all(
      llmBooks.map(book => fetchBookMetadata(book.title, book.author))
    );

    // Merge LLM picks with Google Books metadata
    const recommendations: BookRecommendation[] = llmBooks.map((llmBook, i) => ({
      id: metadataResults[i].id || `llm-${i}`,
      title: llmBook.title,
      author: llmBook.author,
      description: metadataResults[i].description || '',
      genre: metadataResults[i].genre || 'Fiction',
      reason: llmBook.reason,
      coverUrl: metadataResults[i].coverUrl || '',
      amazonUrl:
        metadataResults[i].amazonUrl ||
        `https://www.amazon.com/s?k=${encodeURIComponent(llmBook.title)}`,
      rating: metadataResults[i].rating || 4.0,
    }));

    return NextResponse.json({
      artist: artist.name,
      genres: artist.genres || [],
      recommendations,
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
