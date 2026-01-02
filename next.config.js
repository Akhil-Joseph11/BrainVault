/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Optimized for Vercel deployment
  output: undefined, // Let Vercel handle output
}

module.exports = nextConfig

