import { promises as fs } from "fs";
import path from "path";
import { SportScheduleView } from "@/components/SportScheduleView";
import type { ScheduleData } from "@/lib/types";
import type { Metadata } from "next";
import { sportsEventsLd, breadcrumbLd, todayLabel } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const date = todayLabel();
  return {
    title: `NFL Games on TV Tonight — ${date}`,
    description: `Every NFL football game on TV or streaming on ${date}. Kickoff times and channels — CBS, Fox, NBC Sunday Night Football, ESPN Monday Night Football, Amazon Prime Video Thursday Night Football.`,
    openGraph: {
      title: `NFL Games on TV Tonight — ${date}`,
      description: "Every NFL game. Every platform. Kickoff times and channels.",
      type: "website",
      url: "https://gamesballs.org/nfl",
    },
    twitter: { card: "summary_large_image", title: `NFL on TV Tonight — ${date}` },
    alternates: { canonical: "https://gamesballs.org/nfl" },
  };
}

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

  const todayGames = schedule.dates[today] ?? [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventsLd(todayGames, "nfl")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd("NFL", "/nfl")) }} />

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
