import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images-na.ssl-images-amazon.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'books.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'books.google.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
