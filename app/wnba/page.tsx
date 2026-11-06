import { promises as fs } from "fs";
import path from "path";
import { SportScheduleView } from "@/components/SportScheduleView";
import type { ScheduleData } from "@/lib/types";
import type { Metadata } from "next";
import { breadcrumbLd, sportsEventsLd, todayLabel } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const date = todayLabel();
  return {
    title: `WNBA Games on TV Tonight — ${date}`,
    description: `Every WNBA basketball game on TV or streaming on ${date}. Tip-off times and channels — ESPN, ABC, ION and more.`,
    openGraph: {
      title: `WNBA Games on TV Tonight — ${date}`,
      description: "Every WNBA game. Every platform. One place.",
      type: "website",
      url: "https://gamesballs.org/wnba",
    },
    twitter: { card: "summary_large_image", title: `WNBA on TV Tonight — ${date}` },
    alternates: { canonical: "https://gamesballs.org/wnba" },
  };
}

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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd("WNBA", "/wnba")) }} />
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

  const todayGames = schedule.dates[today] ?? [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventsLd(todayGames, "wnba")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd("WNBA", "/wnba")) }} />

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
