import { promises as fs } from "fs";
import path from "path";
import { ScheduleView } from "@/components/ScheduleView";
import type { ScheduleData } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MLB Games on TV Tonight | Where to Watch Baseball",
  description:
    "Every MLB game on TV or streaming tonight — Apple TV+ Friday Night Baseball, ESPN, Fox, and more. Live scores, odds, and highlights.",
  openGraph: {
    title: "MLB Games on TV Tonight",
    description: "Every MLB game. Every platform. One place.",
    type: "website",
  },
};

export const revalidate = 3600;

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "schedule.json");
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

export default async function MLBPage() {
  const schedule = await getSchedule();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  if (!schedule) {
    return <p className="text-gray-500 py-20 text-center">Schedule loading…</p>;
  }

  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">MLB Games on TV Tonight</h1>
        <p className="text-gray-400 text-sm">
          Every MLB game. Every platform. One place.{" "}
          <span className="text-gray-600">Updated {schedule.generated_at}.</span>
        </p>
      </section>
      <ScheduleView schedule={schedule} today={today} />
    </>
  );
}
