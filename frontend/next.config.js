/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin(
  // This is the default (also the path where the plugin searches for your messages
  // when not specified otherwise)
  './src/i18n.ts'
);

const nextConfig = {
  // Enable SWR and compression
  compress: true,
  poweredByHeader: false,
  
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Enable AVIF format for better compression
    formats: ['image/avif', 'image/webp'],
    // Optimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  
  typescript: {
    // Ignore type errors during build
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Reduce bundle size
  productionBrowserSourceMaps: false,
  swcMinify: true,
};

module.exports = withNextIntl(nextConfig);
