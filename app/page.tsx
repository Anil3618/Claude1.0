import { promises as fs } from "fs";
import path from "path";
import { GameCard } from "@/components/GameCard";
import type { Game, ScheduleData } from "@/lib/types";

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "data",
      "schedule.json"
    );
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

function formatDateHeading(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00"); // noon local avoids UTC off-by-one
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  if (dateStr === today.toISOString().slice(0, 10)) return "Today";
  if (dateStr === tomorrow.toISOString().slice(0, 10)) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function HomePage() {
  const schedule = await getSchedule();
  const today = new Date().toISOString().slice(0, 10);

  if (!schedule) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-xl mb-2">Schedule loading…</p>
        <p className="text-sm">Check back in a few minutes.</p>
      </div>
    );
  }

  const todayGames: Game[] = schedule.dates[today] ?? [];
  const upcomingDates = Object.keys(schedule.dates)
    .filter((d) => d > today)
    .sort()
    .slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-1">
          Baseball on TV Tonight
        </h1>
        <p className="text-gray-400 text-sm">
          Every MLB game. Every platform. One place.{" "}
          <span className="text-gray-600">
            Updated {schedule.generated_at}.
          </span>
        </p>
      </section>

      {/* Tonight's games */}
      <section className="mb-12">
        <h2 className="text-lg font-semibold text-gray-300 mb-4 uppercase tracking-wide text-xs">
          Today · {today}
        </h2>
        {todayGames.length === 0 ? (
          <p className="text-gray-500">No games scheduled today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {todayGames.map((game) => (
              <GameCard key={game.game_pk} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcomingDates.map((dateStr) => {
        const games: Game[] = schedule.dates[dateStr] ?? [];
        return (
          <section key={dateStr} className="mb-10">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 uppercase tracking-wide text-xs">
              {formatDateHeading(dateStr)} · {dateStr}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map((game) => (
                <GameCard key={game.game_pk} game={game} />
              ))}
            </div>
          </section>
        );
      })}
    </>
  );
}

// Revalidate every 6 hours to match the GitHub Actions cron
export const revalidate = 21600;
