import { promises as fs } from "fs";
import path from "path";
import { SportScheduleView } from "@/components/SportScheduleView";
import type { ScheduleData } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "NFL Games on TV Tonight | Where to Watch",
  description: "Every NFL game on TV or streaming — CBS, Fox, NBC, ESPN, Amazon Prime Video and more in one place.",
};

export const revalidate = 3600;

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", "nfl.json"), "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

export default async function NFLPage() {
  const schedule = await getSchedule();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  if (!schedule) {
    return <p className="text-gray-500 py-20 text-center">Schedule loading…</p>;
  }

  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">NFL on TV This Week</h1>
        <p className="text-gray-400 text-sm">
          Every NFL game. Every platform. One place.{" "}
          <span className="text-gray-600">Updated {schedule.generated_at}.</span>
        </p>
      </section>
      <SportScheduleView schedule={schedule} today={today} />
    </>
  );
}
