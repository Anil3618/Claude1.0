import { promises as fs } from "fs";
import path from "path";
import { ScheduleView } from "@/components/ScheduleView";
import type { ScheduleData } from "@/lib/types";

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const schedule = await getSchedule();
  // Use CT so late-night UTC doesn't roll to the next calendar date
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  if (!schedule) {
    return (
      <div className="text-center py-20 text-gray-500">
        <p className="text-xl mb-2">Schedule loading…</p>
        <p className="text-sm">Check back in a few minutes.</p>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Baseball on TV Tonight</h1>
        <p className="text-gray-400 text-sm">
          Every MLB game. Every platform. One place.{" "}
          <span className="text-gray-600">Updated {schedule.generated_at}.</span>
        </p>
      </section>

      <ScheduleView schedule={schedule} today={today} />
    </>
  );
}

export const revalidate = 21600;
