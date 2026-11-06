import { MetadataRoute } from "next";

const BASE = "https://gamesballs.org";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE,                changeFrequency: "hourly", priority: 1.0, lastModified: now },
    { url: `${BASE}/mlb`,       changeFrequency: "hourly", priority: 0.9, lastModified: now },
    { url: `${BASE}/nfl`,       changeFrequency: "hourly", priority: 0.9, lastModified: now },
    { url: `${BASE}/nba`,       changeFrequency: "hourly", priority: 0.9, lastModified: now },
    { url: `${BASE}/nhl`,       changeFrequency: "hourly", priority: 0.9, lastModified: now },
    { url: `${BASE}/wnba`,      changeFrequency: "daily",  priority: 0.7, lastModified: now },
    { url: `${BASE}/soccer`,    changeFrequency: "hourly", priority: 0.8, lastModified: now },
  ];
}
