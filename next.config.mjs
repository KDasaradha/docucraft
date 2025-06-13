// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['genkit', '@genkit-ai/core', 'dotprompt', 'handlebars'],
  // Other configurations, e.g.:
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize packages that don't work well with webpack
      config.externals.push('handlebars', 'dotprompt');
    }
    return config;
  },
  // Add any other settings you had
};

export default nextConfig;