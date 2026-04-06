import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { ScheduleData } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: { date: string } }
) {
  // Validate date format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(params.date)) {
    return NextResponse.json(
      { error: "Invalid date format. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    const raw = await fs.readFile(filePath, "utf8");
    const schedule: ScheduleData = JSON.parse(raw);

    const games = schedule.dates[params.date] ?? [];

    return NextResponse.json(
      {
        date: params.date,
        game_count: games.length,
        games,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Schedule data unavailable" },
      { status: 503 }
    );
  }
}
