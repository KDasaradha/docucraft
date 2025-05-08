
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add other image hostnames if your markdown files use them
      // Example for a potential self-hosted or CDN logo if not using public folder
      // {
      //   protocol: 'https',
      //   hostname: 'your-cdn.com',
      // },
    ],
  },
};

export default nextConfig;
