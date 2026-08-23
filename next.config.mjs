/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['chart.js', 'react-chartjs-2', 'react-select', '@tanstack/react-table', 'framer-motion'],
  },
  async headers() {
    return [
      {
        source: '/rsamdio.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
