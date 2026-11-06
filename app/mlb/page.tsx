import { promises as fs } from "fs";
import path from "path";
import { ScheduleView } from "@/components/ScheduleView";
import type { ScheduleData } from "@/lib/types";
import type { Metadata } from "next";
import { sportsEventsLd, breadcrumbLd, todayLabel } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const date = todayLabel();
  return {
    title: `MLB Games on TV Tonight — ${date}`,
    description: `Every MLB baseball game on TV or streaming on ${date}. Live scores, start times, and channels — ESPN, Fox, FS1, Apple TV+ Friday Night Baseball and more.`,
    openGraph: {
      title: `MLB Games on TV Tonight — ${date}`,
      description: "Every MLB game. Every platform. Live scores and odds.",
      type: "website",
      url: "https://gamesballs.org/mlb",
    },
    twitter: {
      card: "summary_large_image",
      title: `MLB on TV Tonight — ${date}`,
      description: "Every MLB game, channel, and start time. Updated hourly.",
    },
    alternates: { canonical: "https://gamesballs.org/mlb" },
  };
}

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", "schedule.json"), "utf8");
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

  const todayGames = schedule.dates[today] ?? [];
  const eventsLd = sportsEventsLd(todayGames, "mlb");
  const crumbLd  = breadcrumbLd("MLB", "/mlb");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />

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
