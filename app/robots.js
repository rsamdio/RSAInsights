export default function robots() {
  const baseUrl = 'https://insights.rsamdio.org';

  // Allow major search and AI crawlers to index public pages.
  // Keep /api/ disallowed for generic indexing; agents should use OpenAPI / MCP instead.
  const publicRules = {
    allow: ['/', '/llms.txt', '/llms-full.txt', '/ai-overview.md', '/openapi.json', '/sitemap.xml'],
    disallow: ['/api/'],
  };

  return {
    rules: [
      {
        userAgent: '*',
        ...publicRules,
      },
      {
        userAgent: 'GPTBot',
        ...publicRules,
      },
      {
        userAgent: 'ChatGPT-User',
        ...publicRules,
      },
      {
        userAgent: 'OAI-SearchBot',
        ...publicRules,
      },
      {
        userAgent: 'ClaudeBot',
        ...publicRules,
      },
      {
        userAgent: 'anthropic-ai',
        ...publicRules,
      },
      {
        userAgent: 'PerplexityBot',
        ...publicRules,
      },
      {
        userAgent: 'Google-Extended',
        ...publicRules,
      },
      {
        userAgent: 'Applebot-Extended',
        ...publicRules,
      },
      {
        userAgent: 'Amazonbot',
        ...publicRules,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
