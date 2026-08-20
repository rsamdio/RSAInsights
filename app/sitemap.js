import { getDashboardSummary, getZoneSummary, getAllClubs } from '@/lib/api';

export default async function sitemap() {
  const baseUrl = 'https://insights.rsamdio.org';
  const now = new Date();

  // 1. Static high-level routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/worldwide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  // 2. Dynamic Zone routes
  const summary = getDashboardSummary();
  const zoneRoutes = [];
  if (summary?.current?.zones) {
    Object.keys(summary.current.zones).forEach((zoneKey) => {
      const zoneNum = zoneKey.replace(/[^0-9]/g, '');
      if (zoneNum) {
        zoneRoutes.push({
          url: `${baseUrl}/zone/${zoneNum}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    });
  }

  // 3. Dynamic District routes
  const zoneSummary = getZoneSummary() || [];
  const districtSet = new Set();
  const districtRoutes = [];

  zoneSummary.forEach((item) => {
    const dist = item['RI District']?.toString()?.trim();
    if (dist && !districtSet.has(dist)) {
      districtSet.add(dist);
      districtRoutes.push({
        url: `${baseUrl}/district/${encodeURIComponent(dist)}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  });

  // 4. Dynamic Club routes (2,820+ clubs)
  const allClubs = getAllClubs() || [];
  const clubSet = new Set();
  const clubRoutes = [];

  allClubs.forEach((club) => {
    const clubId = (club['Club ID'] || club.id)?.toString()?.trim();
    if (clubId && !clubSet.has(clubId)) {
      clubSet.add(clubId);
      clubRoutes.push({
        url: `${baseUrl}/club/${encodeURIComponent(clubId)}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.7,
      });
    }
  });

  return [...staticRoutes, ...zoneRoutes, ...districtRoutes, ...clubRoutes];
}
