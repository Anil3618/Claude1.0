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
    title: `MLS Soccer Games on TV Tonight — ${date}`,
    description: `Every MLS soccer game on TV or streaming on ${date}. Match times and channels — Apple TV+ MLS Season Pass, ESPN and more.`,
    openGraph: {
      title: `MLS Soccer on TV Tonight — ${date}`,
      description: "Every MLS game. Every platform. Match times and channels.",
      type: "website",
      url: "https://gamesballs.org/soccer",
    },
    twitter: { card: "summary_large_image", title: `MLS on TV Tonight — ${date}` },
    alternates: { canonical: "https://gamesballs.org/soccer" },
  };
}

async function getSchedule(): Promise<ScheduleData | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", "soccer.json"), "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

export default async function SoccerPage() {
  const schedule = await getSchedule();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  if (!schedule) {
    return <p className="text-gray-500 py-20 text-center">Schedule loading…</p>;
  }

  const todayGames = schedule.dates[today] ?? [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsEventsLd(todayGames, "soccer")) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd("MLS", "/soccer")) }} />

      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-1">MLS on TV Tonight</h1>
        <p className="text-gray-400 text-sm">
          Every MLS game. Every platform. One place.{" "}
          <span className="text-gray-600">Updated {schedule.generated_at}.</span>
        </p>
      </section>
      <SportScheduleView schedule={schedule} today={today} />
    </>
  );
}
