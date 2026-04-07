import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Game, ScheduleData } from "@/lib/types";

function teamSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ team: string }> }
) {
  const { team } = await params;
  const slug = team.toLowerCase();

  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    const raw = await fs.readFile(filePath, "utf8");
    const schedule: ScheduleData = JSON.parse(raw);

    const teamGames: { date: string; game: Game }[] = [];
    let resolvedTeamName = "";

    for (const [date, games] of Object.entries(schedule.dates)) {
      for (const g of games) {
        const homeSlug = teamSlug(g.home_team.name);
        const awaySlug = teamSlug(g.away_team.name);

        // Also match by abbreviation (e.g., "nyy", "lad")
        const homeAbbr = g.home_team.abbreviation?.toLowerCase();
        const awayAbbr = g.away_team.abbreviation?.toLowerCase();

        if (
          homeSlug === slug || awaySlug === slug ||
          homeAbbr === slug || awayAbbr === slug
        ) {
          teamGames.push({ date, game: g });
          if (!resolvedTeamName) {
            resolvedTeamName =
              homeSlug === slug || homeAbbr === slug
                ? g.home_team.name
                : g.away_team.name;
          }
        }
      }
    }

    if (!resolvedTeamName) {
      return NextResponse.json(
        { error: `Team not found: ${team}` },
        { status: 404 }
      );
    }

    teamGames.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      team: resolvedTeamName,
      game_count: teamGames.length,
      games: teamGames.map(({ date, game }) => ({ date, ...game })),
    });
  } catch {
    return NextResponse.json(
      { error: "Schedule data unavailable" },
      { status: 503 }
    );
  }
}
