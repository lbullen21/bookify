# 📚🎵 Bookify

**Discover your next great read based on your music taste**

Bookify is an intelligent book recommendation platform that analyzes your Spotify listening habits and uses AI to suggest books that match your musical preferences. Whether you're into indie folk, electronic beats, or classic rock, Bookify finds literary works that resonate with your vibe.

![Bookify Demo](https://img.shields.io/badge/Status-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-16.0.8-black) ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-blue) ![Spotify](https://img.shields.io/badge/Spotify-API-1DB954)

## ✨ Features

### 🎯 **Intelligent Music Analysis**

- Connect your Spotify account to analyze listening patterns
- View top artists and recently played tracks
- Understand your musical preferences and genres

### 🤖 **AI-Powered Book Matching**

- Uses OpenAI GPT-4o-mini to generate personalized book search queries
- Creates intelligent connections between musical artists and literary genres
- Provides detailed explanations for why each book matches your taste

### 📖 **Rich Book Recommendations**

- 5+ personalized recommendations per artist
- Book covers, ratings, descriptions, and Amazon links
- Powered by Google Books API for comprehensive book data

### 🔄 **Real-Time Recommendations**

- Click any artist or recent track for instant book suggestions
- Fallback system ensures recommendations even when AI is unavailable
- Automatic token refresh for seamless Spotify integration

## 🚀 Live Demo

Visit **[https://127.0.0.1:3000](https://127.0.0.1:3000)** (local HTTPS development)

## 🛠️ Technology Stack

- **Frontend**: Next.js 16.0.8, React 19, Tailwind CSS
- **Authentication**: NextAuth.js with Spotify OAuth
- **APIs**: Spotify Web API, Google Books API, OpenAI API
- **AI**: GPT-4o-mini for intelligent recommendations
- **Deployment**: HTTPS development server with SSL certificates

## 📋 Prerequisites

- **Node.js** 18+
- **Spotify Developer Account** for API access
- **OpenAI API Account** for AI recommendations
- **SSL Certificates** for HTTPS (required by Spotify OAuth)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/lbullen21/bookify.git
cd bookify
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Spotify OAuth Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# NextAuth Configuration - HTTPS required for Spotify
NEXTAUTH_URL=https://127.0.0.1:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OpenAI Configuration for AI recommendations
OPENAI_API_KEY=your_openai_api_key

# Development Environment
NODE_ENV=development
```

### 3. Spotify App Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add redirect URI: `https://127.0.0.1:3000/api/auth/callback/spotify`
4. Copy Client ID and Client Secret to `.env.local`

### 4. OpenAI API Setup

1. Visit [OpenAI API Platform](https://platform.openai.com/api-keys)
2. Create an API key
3. Add it to `.env.local` as `OPENAI_API_KEY`

### 5. SSL Certificates

Generate SSL certificates for HTTPS development:

```bash
# Using mkcert (recommended)
mkcert -install
mkcert 127.0.0.1

# Or using openssl
openssl req -x509 -newkey rsa:4096 -keyout 127.0.0.1-key.pem -out 127.0.0.1.pem -days 365 -nodes
```

Place `127.0.0.1.pem` and `127.0.0.1-key.pem` in the project root.

### 6. Start Development Server

```bash
npm run dev
```

The app will be available at **https://127.0.0.1:3000**

## 📖 Usage Guide

### Getting Started

1. **Visit the App**: Navigate to https://127.0.0.1:3000
2. **Connect Spotify**: Click "Connect with Spotify" and authorize the app
3. **View Your Profile**: See your top artists and recent listening history

### Getting Book Recommendations

1. **Click Any Artist**: Click on artists in your top artists list
2. **Click Recent Tracks**: Click on any recently played track
3. **View Recommendations**: See 5+ personalized book suggestions with AI-generated explanations
4. **Explore Books**: Click book covers or Amazon links to learn more

### Understanding Recommendations

Each book recommendation includes:

- **Cover Image**: Visual representation from Google Books
- **Personalized Reason**: AI-generated explanation connecting the book to your musical taste
- **Amazon Link**: Direct link to purchase or learn more

## 🏗️ Architecture

### API Routes

- `/api/auth/[...nextauth]` - NextAuth.js authentication
- `/api/spotify/listening-profile` - User's Spotify data analysis
- `/api/spotify/top-artists` - Top artists endpoint
- `/api/spotify/recently-played` - Recent tracks endpoint
- `/api/recommendations` - AI-powered book recommendations
- `/api/chat` - Conversational book recommendations
- `/api/debug/session` - Authentication debugging

### Key Components

- `AuthenticatedContent` - Main authenticated user interface
- `SpotifyListeningData` - Music analysis and artist display
- `BookRecommendations` - Book recommendation results
- `BookChat` - Interactive chat interface
- `ClientWrapper` - Hydration-safe client component

### AI Workflow

1. **Artist Analysis**: Extract artist name and genres from Spotify data
2. **Query Generation**: AI creates 5-7 targeted book search queries
3. **Book Fetching**: Google Books API retrieval with relevance ranking
4. **Reason Generation**: AI explains why each book matches the artist
5. **Fallback System**: Ensures recommendations even if AI fails

## 🔒 Security Features

- **HTTPS Only**: All communication encrypted with SSL
- **OAuth 2.0**: Secure Spotify authentication
- **Token Refresh**: Automatic access token renewal
- **Environment Variables**: Sensitive data protection
- **CORS Protection**: Secure API endpoints

## 🛠️ Development Scripts

```bash
npm run dev        # Start HTTPS development server
npm run dev:http   # Start HTTP development server (limited functionality)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
npm run format     # Format code with Prettier
```

## 🐛 Troubleshooting

### Common Issues

**Spotify 401 Errors**

- Token expired - reconnect your Spotify account
- Check redirect URI matches exactly: `https://127.0.0.1:3000/api/auth/callback/spotify`

**SSL Certificate Issues**

- Ensure certificates are in project root
- Browser may show security warning - click "Advanced" → "Proceed to 127.0.0.1"

**OpenAI Rate Limits**

- App includes fallback recommendations when AI quota exceeded
- Consider upgrading OpenAI plan for higher limits

**Hydration Errors**

- App uses advanced hydration-safe architecture
- Clear browser cache and restart development server

### Debug Mode

Visit `/debug` for session and API testing:

- https://127.0.0.1:3000/debug

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with descriptive messages
5. Push to your fork and submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spotify** for their comprehensive music API
- **Google Books** for extensive book data
- **OpenAI** for intelligent AI recommendations
- **Next.js** for the powerful React framework
- **NextAuth.js** for seamless authentication

## 📬 Contact

- **Developer**: Lauren Bullen
- **Repository**: [https://github.com/lbullen21/bookify](https://github.com/lbullen21/bookify)
- **Issues**: [GitHub Issues](https://github.com/lbullen21/bookify/issues)

---

**Made with ❤️ for music lovers and book enthusiasts**

_Discover your next favorite book through the power of your music taste!_ 🎵📚
