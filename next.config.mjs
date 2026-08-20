/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['chart.js', 'react-chartjs-2', 'react-select', '@tanstack/react-table'],
  },
};

export default nextConfig;
