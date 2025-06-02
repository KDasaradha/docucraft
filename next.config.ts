
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Additional error handling options
  swcMinify: true,
  experimental: {
    // Ignore build warnings
    optimizePackageImports: ['lucide-react'],
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
  webpack: (config, { isServer }) => {
    // Handle OpenTelemetry and other problematic modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Ignore problematic modules during build
    config.externals = config.externals || [];
    if (isServer) {
      config.externals.push('@opentelemetry/exporter-jaeger');
    }

    // Handle handlebars require.extensions issue
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/handlebars/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    });

    return config;
  },
};

export default nextConfig;
