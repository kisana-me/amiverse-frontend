import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  watchOptions: {
    pollIntervalMs: 1000,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kisana.me',
        port: '',
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
    ];
  },
};

export default nextConfig;
