import { promises as fs } from "fs";
import path from "path";
import { SportScheduleView } from "@/components/SportScheduleView";
import type { ScheduleData } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WNBA Games on TV Tonight | Where to Watch",
  description: "Every WNBA game on TV or streaming tonight — ESPN, ABC, Ion and more in one place.",
};

export const revalidate = 3600;

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", "wnba.json"), "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

export default async function WNBAPage() {
  const schedule = await getSchedule();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  if (!schedule || schedule.game_count === 0) {
    return (
      <>
        <section className="mb-8">
          <h1 className="text-3xl font-bold mb-1">WNBA on TV</h1>
          <p className="text-gray-400 text-sm">Every WNBA game. Every platform. One place.</p>
        </section>
        <p className="text-gray-500 py-10">
          The WNBA season is currently in its off-season. Check back when the season begins in May.
        </p>
      </>
    );
  }

  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">WNBA on TV Tonight</h1>
        <p className="text-gray-400 text-sm">
          Every WNBA game. Every platform. One place.{" "}
          <span className="text-gray-600">Updated {schedule.generated_at}.</span>
        </p>
      </section>
      <SportScheduleView schedule={schedule} today={today} />
    </>
  );
}
