# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev          # HTTPS dev server (required for Spotify OAuth)
npm run dev:http     # HTTP dev server (Spotify auth won't work)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier (write)
npm run format:check # Prettier (check only)
```

**Why HTTPS for dev:** Spotify OAuth requires HTTPS. `npm run dev` uses a custom `server.js` that wraps Next.js with Node's native `https` module and local SSL certs (`127.0.0.1.pem`, `127.0.0.1-key.pem` — gitignored, must exist locally). `NEXTAUTH_URL` in `.env.local` must be `https://127.0.0.1:3000`.

## Architecture Overview

### Data Flow

```
Spotify OAuth (NextAuth) → session.accessToken
    ↓
GET /api/spotify/listening-profile
    → SpotifyAPI.getTopArtists('long_term', 50)
    → genre-based analysis (energy, mood, danceability, acousticness)
    ↓
User clicks artist
    ↓
POST /api/recommendations { artist }
    → OpenAI GPT-4o-mini → 5 book titles
    → Google Books API → cover, rating, description per book
    → Amazon search URL constructed from ISBN or title
    ↓
BookRecommendations modal
```

### Component Hierarchy

```
app/page.tsx
  └── ClientWrapper (sticky nav, footer, session display)
       └── AuthenticatedContent (auth state router)
            ├── (no session) Hero + feature cards + SpotifyButton
            └── (session) SpotifyListeningData
                  ├── Music profile section (energy/mood/danceability/style tags)
                  ├── Top artists grid (shuffleable, clickable)
                  └── BookRecommendations modal (on artist click)
```

### Key Files

- `lib/auth.ts` — NextAuth config: Spotify OAuth scopes, JWT/session callbacks, automatic token refresh
- `lib/spotify.ts` — `SpotifyAPI` class + all TypeScript interfaces (`SpotifyArtist`, `SpotifyTrack`, etc.)
- `app/api/spotify/listening-profile/route.ts` — Fetches top 50 artists, derives `musicProfile` via genre regex
- `app/api/recommendations/route.ts` — LLM → Google Books → returns `BookRecommendation[]`
- `components/ClientWrapper.tsx` — App shell; handles hydration guard

### Auth Pattern

NextAuth stores the Spotify access token in the JWT. The token refresh logic lives in `lib/auth.ts`. API routes access the token via `getServerSession(authOptions)` and instantiate `SpotifyAPI` using `createSpotifyAPI(session)` from `lib/spotify.ts`.

## Environment Variables

```bash
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
NEXTAUTH_URL=https://127.0.0.1:3000
NEXTAUTH_SECRET=
OPENAI_API_KEY=
GOOGLE_BOOKS_API_KEY=
```

## UI Design System

- **Palette:** `slate-50` page bg, `slate-900` text, `indigo-600` accent, `#1DB954` Spotify green
- **Cards:** `bg-white border border-slate-200 rounded-xl shadow-sm`
- **Icons:** Inline SVG only — no icon libraries
- **No gradients, no emojis** in UI
- Style inspiration: Stripe/Linear/Notion (flat, clean, generous spacing)

## Stack

- Next.js 15 (App Router), React 19, TypeScript 5
- Tailwind CSS v4 (PostCSS — no `tailwind.config.js` needed)
- NextAuth 4 (Spotify provider)
- OpenAI GPT-4o-mini, Google Books API, Spotify Web API