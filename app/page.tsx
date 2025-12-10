import SpotifyButton from '@/src/SpotifyButton.component';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-green-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
      <main className="container mx-auto px-6 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
            📚 Bookify
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover your next great read based on your Spotify listening habits
          </p>
        </header>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto text-center mb-16">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-4xl font-semibold text-gray-900 dark:text-white mb-6">
              Music Meets Literature
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              Connect your Spotify account and let us recommend books that match
              the mood, genre, and energy of your favorite music. From indie
              folk to electronic beats, we&apos;ll find the perfect literary
              companion for your soundtrack.
            </p>

            {/* Spotify Login Button */}
            <SpotifyButton />
          </div>
        </section>

        {/* Features Preview */}
        <section className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-semibold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Connect Your Music
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Link your Spotify account to analyze your listening patterns and
                preferences
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="text-4xl mb-4">🤖</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Analysis
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Our algorithm matches your music taste with literary genres and
                themes
              </p>
            </div>
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 text-center">
              <div className="text-4xl mb-4">📖</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Perfect Matches
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Receive personalized book recommendations that resonate with
                your vibe
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-20 text-gray-500 dark:text-gray-400">
          <p>
            Ready to discover your next favorite book? Start by connecting your
            Spotify account above.
          </p>
        </footer>
      </main>
    </div>
  );
}
