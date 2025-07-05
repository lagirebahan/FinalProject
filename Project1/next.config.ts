import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization configuration
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  // Headers configuration for TensorFlow.js
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Enable CORP for TensorFlow.js
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
          {
            key: 'Cross-Origin-Opener-Policy', 
            value: 'same-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for TensorFlow.js
  webpack: (config, { isServer }) => {
    // Ignore node-specific modules when bundling for the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    // Handle TensorFlow.js specific configurations
    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    return config;
  },

  // React strict mode
  reactStrictMode: true,

  // SWC minify for better performance
  swcMinify: true,

  // PoweredByHeader
  poweredByHeader: false,
};

export default nextConfig;