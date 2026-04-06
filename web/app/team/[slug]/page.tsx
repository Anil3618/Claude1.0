import { promises as fs } from "fs";
import path from "path";
import { GameCard } from "@/components/GameCard";
import type { Game, ScheduleData } from "@/lib/types";
import { notFound } from "next/navigation";

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function teamSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export default async function TeamPage({
  params,
}: {
  params: { slug: string };
}) {
  const schedule = await getSchedule();
  if (!schedule) return <p className="text-gray-500">Schedule unavailable.</p>;

  // Find all games for this team slug
  const teamGames: { date: string; game: Game }[] = [];
  let teamName = "";

  for (const [date, games] of Object.entries(schedule.dates)) {
    for (const g of games) {
      const homeSlug = teamSlug(g.home_team.name);
      const awaySlug = teamSlug(g.away_team.name);
      if (homeSlug === params.slug || awaySlug === params.slug) {
        teamGames.push({ date, game: g });
        teamName = homeSlug === params.slug ? g.home_team.name : g.away_team.name;
      }
    }
  }

  if (!teamName) notFound();

  teamGames.sort((a, b) => a.date.localeCompare(b.date));

  return (
    <>
      <h1 className="text-3xl font-bold mb-2">{teamName} Schedule</h1>
      <p className="text-gray-400 text-sm mb-8">
        Upcoming {teamName} games — with broadcast &amp; streaming info.
      </p>

      {teamGames.length === 0 ? (
        <p className="text-gray-500">No upcoming games found.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {teamGames.map(({ date, game }) => (
            <div key={game.game_pk}>
              <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">{date}</p>
              <GameCard game={game} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export const revalidate = 21600;
