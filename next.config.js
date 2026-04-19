/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  /**
   * Webpack’s persistent filesystem cache in dev can get out of sync (missing
   * vendor-chunks/*.js, stale chunk ids like ./948.js). Disabling it avoids
   * corrupt incremental state; compile is slightly slower but stable.
   */
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
  output: undefined,
};

module.exports = nextConfig;
