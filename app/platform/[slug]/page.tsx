import { promises as fs } from "fs";
import path from "path";
import { GameCard } from "@/components/GameCard";
import type { Game, ScheduleData } from "@/lib/types";
import { notFound } from "next/navigation";

const SLUG_TO_LABEL: Record<string, string> = {
  "apple-tv-plus":  "Apple TV+",
  "netflix":        "Netflix",
  "peacock":        "Peacock",
  "max":            "Max",
  "prime-video":    "Prime Video",
  "espn":           "ESPN",
  "espn-plus":      "ESPN+",
  "espn2":          "ESPN2",
  "fox":            "Fox",
  "fs1":            "FS1",
  "tbs":            "TBS",
  "nbc":            "NBC",
  "mlb-network":    "MLB Network",
  "mlb-tv":         "MLB.TV",
  "youtube-tv":     "YouTube TV",
  "sling-tv":       "Sling TV",
  "directv-stream": "DirecTV Stream",
};

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

export default async function PlatformPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const label = SLUG_TO_LABEL[slug];
  if (!label) notFound();

  const schedule = await getSchedule();
  if (!schedule) return <p className="text-gray-500">Schedule unavailable.</p>;

  // Collect all games for this platform across all dates
  const gamesByDate: Record<string, Game[]> = {};
  for (const [date, games] of Object.entries(schedule.dates)) {
    const matching = games.filter((g) =>
      g.platforms.some((p) => p.label === label)
    );
    if (matching.length > 0) gamesByDate[date] = matching;
  }

  const hasgames = Object.keys(gamesByDate).length > 0;

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">
        MLB on {label}
      </h1>
      <p className="text-gray-400 text-sm mb-8">
        All upcoming MLB games streaming on {label} in the next 7 days.
      </p>

      {!hasgames ? (
        <p className="text-gray-500">No games found for {label} in the next 7 days.</p>
      ) : (
        Object.entries(gamesByDate)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, games]) => (
            <section key={date} className="mb-8">
              <h2 className="text-xs uppercase tracking-wide text-gray-500 mb-3 font-semibold">
                {date}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {games.map((g) => (
                  <GameCard key={g.game_pk} game={g} />
                ))}
              </div>
            </section>
          ))
      )}
    </>
  );
}

export async function generateStaticParams() {
  return Object.keys(SLUG_TO_LABEL).map((slug) => ({ slug }));
}

export const revalidate = 21600;
