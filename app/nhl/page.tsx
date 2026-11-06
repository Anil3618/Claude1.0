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
    title: `NHL Games on TV Tonight — ${date}`,
    description: `Every NHL hockey game on TV or streaming on ${date}. Puck-drop times and channels — ESPN, ABC, TNT, TBS, truTV, NHL Network.`,
    openGraph: {
      title: `NHL Games on TV Tonight — ${date}`,
      description: "Every NHL game. Every platform. Puck-drop times and channels.",
      type: "website",
      url: "https://gamesballs.org/nhl",
    },
    twitter: { card: "summary_large_image", title: `NHL on TV Tonight — ${date}` },
    alternates: { canonical: "https://gamesballs.org/nhl" },
  };
}

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", "nhl.json"), "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

export default async function NHLPage() {
  const schedule = await getSchedule();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  if (!schedule) {
    return <p className="text-gray-500 py-20 text-center">Schedule loading…</p>;
  }

  const todayGames = schedule.dates[today] ?? [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventsLd(todayGames, "nhl")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd("NHL", "/nhl")) }} />

      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">NHL on TV Tonight</h1>
        <p className="text-gray-400 text-sm">
          Every NHL game. Every platform. One place.{" "}
          <span className="text-gray-600">Updated {schedule.generated_at}.</span>
        </p>
      </section>
      <SportScheduleView schedule={schedule} today={today} />
    </>
  );
}
