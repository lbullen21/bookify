import { Suspense } from 'react';
import ClientWrapper from '@/components/ClientWrapper';

function LoadingSkeleton() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #faf5ff, #ffffff, #f0fdf4)'
    }}>
      <main style={{ 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '4rem 1.5rem' 
      }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ 
            fontSize: '3.75rem', 
            fontWeight: 'bold', 
            color: '#111827', 
            marginBottom: '1rem' 
          }}>
            📚 Bookify
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#6b7280', 
            maxWidth: '42rem', 
            margin: '0 auto' 
          }}>
            Discover your next great read based on your Spotify listening habits
          </p>
        </header>
        <div style={{
          maxWidth: '56rem',
          margin: '0 auto 4rem auto',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '1rem',
            padding: '3rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
              Loading your music-powered book recommendations...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ClientWrapper />
    </Suspense>
  );
}
