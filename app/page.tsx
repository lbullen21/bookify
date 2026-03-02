import { Suspense } from 'react';
import ClientWrapper from '@/components/ClientWrapper';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center">
          <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-lg mx-auto text-center space-y-4">
          <div className="h-8 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-4 bg-slate-100 rounded-lg animate-pulse w-3/4 mx-auto" />
          <div className="h-10 bg-slate-100 rounded-lg animate-pulse w-44 mx-auto mt-6" />
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
