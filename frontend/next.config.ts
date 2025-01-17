import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '', // Remove port specification
        pathname: '/**', // Allow all paths
      },
    ],
  },
};

export default withNextIntl(nextConfig);
