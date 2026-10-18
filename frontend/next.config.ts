import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/api/:path*', destination: 'devjourney-fullstack.vercel.app' }];
  },
};
export default nextConfig;
