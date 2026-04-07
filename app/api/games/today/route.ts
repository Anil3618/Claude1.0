import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { ScheduleData } from "@/lib/types";

export async function GET(request: Request) {
  // B2B API key check (basic — swap for DB-backed keys when first customer signs up)
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== null && apiKey !== process.env.API_KEY_FREE) {
    // If a key was provided but doesn't match, reject it
    if (process.env.API_KEY_FREE && apiKey !== process.env.API_KEY_FREE) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }
  }

  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    const raw = await fs.readFile(filePath, "utf8");
    const schedule: ScheduleData = JSON.parse(raw);

    const today = new Date().toISOString().slice(0, 10);
    const games = schedule.dates[today] ?? [];

    return NextResponse.json(
      {
        date: today,
        game_count: games.length,
        games,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-Data-Generated": schedule.generated_at,
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
