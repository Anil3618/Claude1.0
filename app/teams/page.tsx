import { promises as fs } from "fs";
import path from "path";
import type { ScheduleData } from "@/lib/types";
import { TeamSearch } from "@/components/TeamSearch";

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

export default async function TeamsPage() {
  const schedule = await getSchedule();

  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">Search by Team</h1>
        <p className="text-gray-400 text-sm">
          Find every game for any MLB team this week — and where to watch.
          Faded teams have no games scheduled.
        </p>
      </section>

      {schedule ? (
        <TeamSearch schedule={schedule} />
      ) : (
        <p className="text-gray-500">Schedule data unavailable. Check back soon.</p>
      )}
    </>
  );
}

export const revalidate = 21600;
