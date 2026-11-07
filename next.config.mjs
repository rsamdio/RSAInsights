/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ['chart.js', 'react-chartjs-2', 'react-select', '@tanstack/react-table'],
  },
  async headers() {
    const llmsDescribedBy = '</llms.txt>; rel="describedby"';
    const aiOverviewAlternate =
      '</ai-overview.md>; rel="alternate"; type="text/markdown"';

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Link',
            value: `${llmsDescribedBy}, ${aiOverviewAlternate}`,
          },
        ],
      },
      {
        source: '/llms.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
          { key: 'X-Robots-Tag', value: 'all' },
        ],
      },
      {
        source: '/llms-full.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
          { key: 'X-Robots-Tag', value: 'all' },
        ],
      },
      {
        source: '/ai-overview.md',
        headers: [
          { key: 'Content-Type', value: 'text/markdown; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400' },
          { key: 'X-Robots-Tag', value: 'all' },
          {
            key: 'Link',
            value: '</llms.txt>; rel="describedby"',
          },
        ],
      },
      {
        source: '/rsamdio.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Method, Mcp-Name, Accept, X-API-Key' },
        ],
      },
      {
        source: '/sse',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Method, Mcp-Name, Accept, X-API-Key' },
        ],
      },
      {
        source: '/mcp',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Method, Mcp-Name, Accept, X-API-Key' },
        ],
      },
      {
        source: '/messages',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization, Mcp-Protocol-Version, Mcp-Method, Mcp-Name, Accept, X-API-Key' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'zone45678analysis.netlify.app',
          },
        ],
        destination: 'https://insights.rsamdio.org/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
