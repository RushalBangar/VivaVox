/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Electron loads from file:// protocol in production
  // assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
  trailingSlash: true,
};

module.exports = nextConfig;
