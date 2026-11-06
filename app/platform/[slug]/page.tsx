import { promises as fs } from "fs";
import path from "path";
import { SportCard } from "@/components/SportCard";
import type { Game, ScheduleData } from "@/lib/types";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { breadcrumbLd } from "@/lib/seo";

const SLUG_TO_LABEL: Record<string, string> = {
  "espn":             "ESPN",
  "abc":              "ABC",
  "fox":              "Fox",
  "cbs":              "CBS",
  "nbc":              "NBC",
  "tnt":              "TNT",
  "tbs":              "TBS",
  "trutv":            "truTV",
  "prime-video":      "Prime Video",
  "apple-tv-plus":    "Apple TV+",
  "peacock":          "Peacock",
  "max":              "Max",
  "espn-plus":        "ESPN+",
  "espn2":            "ESPN2",
  "fs1":              "FS1",
  "nba-tv":           "NBA TV",
  "nhl-network":      "NHL Network",
  "ion":              "ION",
  "mlb-network":      "MLB Network",
  "mlb-tv":           "MLB.TV",
  "mls-season-pass":  "MLS Season Pass",
  "usa-network":      "USA Network",
  "netflix":          "Netflix",
  "youtube-tv":       "YouTube TV",
  "sling-tv":         "Sling TV",
  "directv-stream":   "DirecTV Stream",
};

const ALL_SPORT_FILES = [
  { file: "schedule.json", sport: "mlb" },
  { file: "nfl.json",      sport: "nfl" },
  { file: "nba.json",      sport: "nba" },
  { file: "nhl.json",      sport: "nhl" },
  { file: "wnba.json",     sport: "wnba" },
  { file: "soccer.json",   sport: "soccer" },
];

async function loadSchedule(filename: string): Promise<ScheduleData | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", filename), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const label = SLUG_TO_LABEL[slug];
  if (!label) return {};
  return {
    title: `Sports on ${label} This Week`,
    description: `Every MLB, NFL, NBA, NHL, WNBA, and MLS game streaming on ${label} this week — start times, dates, and matchups.`,
    alternates: { canonical: `https://gamesballs.org/platform/${slug}` },
  };
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = SLUG_TO_LABEL[slug];
  if (!label) notFound();

  // Load all sports in parallel
  const schedules = await Promise.all(
    ALL_SPORT_FILES.map(async ({ file, sport }) => {
      const data = await loadSchedule(file);
      return { sport, dates: data?.dates ?? {} };
    })
  );

  // Collect matching games across all sports and dates
  const gamesByDate: Record<string, Game[]> = {};
  for (const { sport, dates } of schedules) {
    for (const [date, games] of Object.entries(dates)) {
      const matching = games
        .filter(g => g.platforms.some(p => p.label === label))
        .map(g => ({ ...g, sport: g.sport ?? sport }));
      if (matching.length > 0) {
        gamesByDate[date] = [...(gamesByDate[date] ?? []), ...matching];
      }
    }
  }

  const hasGames = Object.keys(gamesByDate).length > 0;
  const crumbLd = breadcrumbLd(label, `/platform/${slug}`);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />

      <h1 className="text-3xl font-bold mb-2">Sports on {label}</h1>
      <p className="text-gray-400 text-sm mb-8">
        All upcoming games streaming on {label} across MLB, NFL, NBA, NHL, WNBA, and MLS.
      </p>

      {!hasGames ? (
        <p className="text-gray-500">No games found for {label} in the next 7 days.</p>
      ) : (
        Object.entries(gamesByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, games]) => (
            <section key={date} className="mb-8">
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3 font-semibold">
                {new Date(date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map(g => (
                  <SportCard key={`${g.sport}-${g.game_pk}`} game={g} />
                ))}
              </div>
            </section>
          ))
      )}
    </>
  );
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_LABEL).map(slug => ({ slug }));
}

export const revalidate = 3600;
