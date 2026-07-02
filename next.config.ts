import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  watchOptions: {
    pollIntervalMs: 1000,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kisana.me',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'amiverse.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amiverse.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/@:name_id',
        destination: '/accounts/:name_id',
      },
      {
        source: '/@:name_id/following',
        destination: '/accounts/:name_id/following',
      },
      {
        source: '/@:name_id/followers',
        destination: '/accounts/:name_id/followers',
      },
    ];
  },
};

export default nextConfig;
