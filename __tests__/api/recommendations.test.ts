import { NextRequest } from 'next/server';
import { POST } from '../../app/api/recommendations/route';

const makeRequest = (body: unknown) =>
  new NextRequest('http://localhost/api/recommendations', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

const mockOpenAIResponse = (books: unknown[]) => ({
  ok: true,
  json: async () => ({
    choices: [{ message: { content: JSON.stringify({ books }) } }],
  }),
});

const mockGoogleBooksResponse = (item?: unknown) => ({
  ok: true,
  json: async () => ({ items: item ? [item] : undefined }),
});

const sampleLLMBooks = [
  { title: 'Book One', author: 'Author A', reason: 'Reason A' },
  { title: 'Book Two', author: 'Author B', reason: 'Reason B' },
  { title: 'Book Three', author: 'Author C', reason: 'Reason C' },
  { title: 'Book Four', author: 'Author D', reason: 'Reason D' },
  { title: 'Book Five', author: 'Author E', reason: 'Reason E' },
];

const sampleGoogleItem = {
  id: 'abc123',
  volumeInfo: {
    title: 'Book One',
    authors: ['Author A'],
    description: 'A'.repeat(250),
    categories: ['Fiction'],
    averageRating: 4.5,
    imageLinks: { thumbnail: 'https://example.com/cover.jpg' },
    industryIdentifiers: [{ type: 'ISBN_13', identifier: '9781234567890' }],
  },
};

beforeEach(() => {
  jest.resetAllMocks();
  process.env.OPENAI_API_KEY = 'test-key';
  process.env.GOOGLE_BOOKS_API_KEY = 'test-google-key';
});

describe('POST /api/recommendations', () => {
  describe('input validation', () => {
    it('returns 400 when artist is missing', async () => {
      const res = await POST(makeRequest({}));
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toBe('Artist data is required');
    });

    it('returns 400 when body is empty object', async () => {
      const res = await POST(makeRequest({ artist: null }));
      expect(res.status).toBe(400);
    });
  });

  describe('successful response', () => {
    it('returns recommendations with correct shape', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse(sampleGoogleItem));

      const res = await POST(
        makeRequest({ artist: { name: 'Radiohead', genres: ['alternative rock'] } })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.artist).toBe('Radiohead');
      expect(body.genres).toEqual(['alternative rock']);
      expect(body.recommendations).toHaveLength(5);
      expect(body.generated_at).toBeDefined();
    });

    it('each recommendation has required fields', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse(sampleGoogleItem));

      const res = await POST(
        makeRequest({ artist: { name: 'Radiohead', genres: ['art rock'] } })
      );
      const { recommendations } = await res.json();

      for (const rec of recommendations) {
        expect(rec).toHaveProperty('id');
        expect(rec).toHaveProperty('title');
        expect(rec).toHaveProperty('author');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('genre');
        expect(rec).toHaveProperty('reason');
        expect(rec).toHaveProperty('amazonUrl');
        expect(rec).toHaveProperty('rating');
      }
    });

    it('merges LLM title/author/reason with Google Books metadata', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse([sampleLLMBooks[0]]))
        .mockResolvedValueOnce(mockGoogleBooksResponse(sampleGoogleItem));

      // Patch: LLM returns only 1 book — still should work (no length guard for 1)
      // We test metadata merge specifically
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse(sampleGoogleItem));

      const res = await POST(
        makeRequest({ artist: { name: 'Radiohead', genres: ['alternative'] } })
      );
      const { recommendations } = await res.json();
      const first = recommendations[0];

      expect(first.title).toBe('Book One');
      expect(first.author).toBe('Author A');
      expect(first.reason).toBe('Reason A');
      expect(first.id).toBe('google-abc123');
      expect(first.rating).toBe(4.5);
      expect(first.genre).toBe('Fiction');
      expect(first.coverUrl).toBe('https://example.com/cover.jpg');
      expect(first.amazonUrl).toContain('9781234567890');
    });

    it('truncates description to 200 chars + ellipsis', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse(sampleGoogleItem));

      const res = await POST(
        makeRequest({ artist: { name: 'Radiohead' } })
      );
      const { recommendations } = await res.json();
      expect(recommendations[0].description).toBe('A'.repeat(200) + '...');
    });

    it('uses title-based Amazon URL when no ISBN', async () => {
      const itemWithoutISBN = {
        ...sampleGoogleItem,
        volumeInfo: { ...sampleGoogleItem.volumeInfo, industryIdentifiers: [] },
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse(itemWithoutISBN));

      const res = await POST(
        makeRequest({ artist: { name: 'Radiohead' } })
      );
      const { recommendations } = await res.json();
      expect(recommendations[0].amazonUrl).toContain(encodeURIComponent('Book One'));
    });

    it('falls back to llm-{i} id when Google Books returns no item', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse()); // no item

      const res = await POST(
        makeRequest({ artist: { name: 'Radiohead' } })
      );
      const { recommendations } = await res.json();
      expect(recommendations[0].id).toBe('llm-0');
      expect(recommendations[4].id).toBe('llm-4');
    });

    it('defaults rating to 4.0 when Google Books has no rating', async () => {
      const itemNoRating = {
        ...sampleGoogleItem,
        volumeInfo: { ...sampleGoogleItem.volumeInfo, averageRating: undefined },
      };

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse(itemNoRating));

      const res = await POST(
        makeRequest({ artist: { name: 'Radiohead' } })
      );
      const { recommendations } = await res.json();
      expect(recommendations[0].rating).toBe(4.0);
    });

    it('handles artist with no genres', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse(sampleGoogleItem));

      const res = await POST(makeRequest({ artist: { name: 'Unknown Artist' } }));
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.genres).toEqual([]);
    });
  });

  describe('error handling', () => {
    it('returns 500 when OpenAI returns non-ok status', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 429 });

      const res = await POST(makeRequest({ artist: { name: 'Radiohead' } }));
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Failed to generate recommendations');
    });

    it('returns 500 when OpenAI returns empty content', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: null } }] }),
      });

      const res = await POST(makeRequest({ artist: { name: 'Radiohead' } }));
      expect(res.status).toBe(500);
    });

    it('returns 500 when LLM returns zero books', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse([]));

      const res = await POST(makeRequest({ artist: { name: 'Radiohead' } }));
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe('Failed to generate recommendations');
    });

    it('continues with empty metadata when Google Books fetch throws', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockRejectedValue(new Error('Network error'));

      const res = await POST(makeRequest({ artist: { name: 'Radiohead' } }));
      expect(res.status).toBe(200);
      const { recommendations } = await res.json();
      expect(recommendations[0].id).toBe('llm-0');
      expect(recommendations[0].rating).toBe(4.0);
    });

    it('returns 500 on unexpected top-level error', async () => {
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('Unexpected'));

      const res = await POST(makeRequest({ artist: { name: 'Radiohead' } }));
      expect(res.status).toBe(500);
    });
  });

  describe('OpenAI API call', () => {
    it('sends request to OpenAI with correct model and artist info', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse());

      await POST(
        makeRequest({ artist: { name: 'Radiohead', genres: ['alternative rock', 'art rock'] } })
      );

      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(url).toBe('https://api.openai.com/v1/chat/completions');
      const reqBody = JSON.parse(options.body);
      expect(reqBody.model).toBe('gpt-4o-mini');
      expect(reqBody.messages[0].content).toContain('Radiohead');
      expect(reqBody.messages[0].content).toContain('alternative rock, art rock');
    });

    it('sends Authorization header with API key', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce(mockOpenAIResponse(sampleLLMBooks))
        .mockResolvedValue(mockGoogleBooksResponse());

      await POST(makeRequest({ artist: { name: 'Radiohead' } }));

      const [, options] = (global.fetch as jest.Mock).mock.calls[0];
      expect(options.headers['Authorization']).toBe('Bearer test-key');
    });
  });
});
