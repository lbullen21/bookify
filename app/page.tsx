import AuthenticatedContent from '@/src/AuthenticatedContent.component';

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

        {/* Authenticated Content */}
        <AuthenticatedContent />

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
