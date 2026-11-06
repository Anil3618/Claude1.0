import type { Game } from "./types";

const SPORT_DISPLAY: Record<string, string> = {
  mlb: "Baseball",
  nfl: "American Football",
  nba: "Basketball",
  nhl: "Ice Hockey",
  wnba: "Basketball",
  soccer: "Soccer",
};

/** ItemList of SportsEvent objects — feeds Google rich results for sport schedules */
export function sportsEventsLd(games: Game[], sport: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${sport.toUpperCase()} Games on TV Tonight`,
    itemListElement: games.slice(0, 12).map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SportsEvent",
        name: `${g.away_team.name} at ${g.home_team.name}`,
        startDate: g.game_time_utc || `${g.game_date}T00:00:00Z`,
        sport: SPORT_DISPLAY[sport] ?? sport,
        ...(g.venue ? { location: { "@type": "StadiumOrArena", name: g.venue } } : {}),
        homeTeam: { "@type": "SportsTeam", name: g.home_team.name },
        awayTeam: { "@type": "SportsTeam", name: g.away_team.name },
        ...(g.platforms?.length > 0
          ? {
              broadcastOfEvent: g.platforms.map((p) => ({
                "@type": "BroadcastEvent",
                broadcastDisplayName: p.label,
              })),
            }
          : {}),
      },
    })),
  };
}

/** BreadcrumbList for sport subpages */
export function breadcrumbLd(label: string, href: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Sports on TV", item: "https://gamesballs.org" },
      { "@type": "ListItem", position: 2, name: label, item: `https://gamesballs.org${href}` },
    ],
  };
}

/** Human-readable date string in PT for use in meta titles */
export function todayLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
