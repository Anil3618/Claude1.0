import { promises as fs } from "fs";
import path from "path";
import Link from "next/link";
import { SportCard } from "@/components/SportCard";
import type { Game, ScheduleData } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports on TV Tonight | Every Game, Every Channel",
  description:
    "What sports are on TV tonight? Every MLB, NBA, NFL, NHL, WNBA, and MLS game live on TV or streaming — ESPN, CBS, Fox, NBC, Amazon Prime Video, Apple TV+ and more. Updated hourly.",
  openGraph: {
    title: "Sports on TV Tonight",
    description: "Every game. Every platform. One place.",
    type: "website",
    url: "https://gamesballs.org",
  },
  alternates: { canonical: "https://gamesballs.org" },
};

export const revalidate = 3600;

const SPORT_CONFIG = [
  { key: "mlb",    file: "schedule.json", label: "MLB",  emoji: "⚾", href: "/mlb",    color: "#CC0000" },
  { key: "nfl",    file: "nfl.json",      label: "NFL",  emoji: "🏈", href: "/nfl",    color: "#013369" },
  { key: "nba",    file: "nba.json",      label: "NBA",  emoji: "🏀", href: "/nba",    color: "#1D428A" },
  { key: "nhl",    file: "nhl.json",      label: "NHL",  emoji: "🏒", href: "/nhl",    color: "#00205B" },
  { key: "wnba",   file: "wnba.json",     label: "WNBA", emoji: "🏀", href: "/wnba",   color: "#FF6900" },
  { key: "soccer", file: "soccer.json",   label: "MLS",  emoji: "⚽", href: "/soccer", color: "#00B140" },
];

async function loadSchedule(filename: string): Promise<ScheduleData | null> {
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "data", filename), "utf8");
    return JSON.parse(raw) as ScheduleData;
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const todayLabel = new Date().toLocaleDateString("en-US", {
    timeZone: "America/Los_Angeles",
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const sections = await Promise.all(
    SPORT_CONFIG.map(async cfg => {
      const data = await loadSchedule(cfg.file);
      const todayGames: Game[] = data?.dates[today] ?? [];
      return { ...cfg, games: todayGames.map(g => ({ ...g, sport: g.sport ?? cfg.key })) };
    })
  );

  const totalTonight = sections.reduce((n, s) => n + s.games.length, 0);
  const activeSections = sections.filter(s => s.games.length > 0);

  const tonightSummary =
    activeSections.length > 0
      ? activeSections.map(s => `${s.games.length} ${s.label} game${s.games.length !== 1 ? "s" : ""}`).join(", ")
      : "No major sports games tonight";

  /* ── Structured data ── */
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What sports are on TV tonight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `On ${todayLabel} there are ${totalTonight} live sports games on TV: ${tonightSummary}. All available on ESPN, CBS, Fox, NBC, Amazon Prime Video, Apple TV+, TNT, TBS and more. This page updates every hour.`,
        },
      },
      {
        "@type": "Question",
        name: "How do I watch sports without cable tonight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Stream tonight's sports on ESPN+ (via the ESPN app), Peacock (NBC games), Amazon Prime Video (Thursday Night Football), Apple TV+ (MLB Friday Night Baseball and all MLS games), Max (TNT/TBS games), and YouTube TV or Hulu Live TV for access to all major cable sports channels.",
        },
      },
      {
        "@type": "Question",
        name: "What NFL games are on TV tonight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NFL games air on CBS (AFC matchups), Fox (NFC matchups), NBC (Sunday Night Football), ESPN and ABC (Monday Night Football), and Amazon Prime Video (Thursday Night Football). Check the NFL section above for tonight's specific game, time, and channel.",
        },
      },
      {
        "@type": "Question",
        name: "What NBA games are on TV tonight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NBA games air nationally on ESPN, ABC, TNT, and NBA TV. Check the NBA section above for tonight's matchups, tip-off times, and which channel each game is on.",
        },
      },
      {
        "@type": "Question",
        name: "What NHL games are on TV tonight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NHL games air on ESPN, ABC, TNT, TBS, truTV, and NHL Network. Check the NHL section above for tonight's puck-drop times and broadcast channels.",
        },
      },
      {
        "@type": "Question",
        name: "What MLB games are on TV tonight?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "MLB games air on ESPN, Fox, FS1, and Apple TV+ (Friday Night Baseball). Check the MLB section above for today's game schedule, start times, and streaming options.",
        },
      },
    ],
  };

  const webPageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Sports on TV Tonight",
    description:
      "Every sports game on TV or streaming tonight — MLB, NBA, NFL, NHL, WNBA, MLS. Updated hourly.",
    url: "https://gamesballs.org",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", ".tonight-summary", ".sport-section-heading"],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />

      {/* ── Hero ── */}
      <section className="mb-10">
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Sports on TV Tonight</h1>
        <p className="tonight-summary text-gray-400 text-base max-w-2xl leading-relaxed">
          {totalTonight > 0 ? (
            <>
              <span className="text-white font-semibold">{totalTonight} game{totalTonight !== 1 ? "s" : ""}</span>
              {" on TV today — "}
              {activeSections.map((s, i) => (
                <span key={s.key}>
                  <Link href={s.href} className="hover:text-white transition-colors">
                    {s.games.length} {s.label}
                  </Link>
                  {i < activeSections.length - 1 ? " · " : ""}
                </span>
              ))}
            </>
          ) : (
            "No major sports games scheduled tonight."
          )}
        </p>

        {/* Sport pill nav */}
        <div className="flex flex-wrap gap-2 mt-5">
          {sections.map(s => (
            <Link
              key={s.key}
              href={s.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                s.games.length > 0
                  ? "border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-white"
                  : "border-gray-800 bg-transparent text-gray-600 hover:text-gray-400"
              }`}
            >
              <span className="text-base leading-none">{s.emoji}</span>
              <span>{s.label}</span>
              {s.games.length > 0 && (
                <span className="text-[11px] bg-gray-700 px-1.5 py-0.5 rounded-full text-gray-300 tabular-nums">
                  {s.games.length}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Sport sections ── */}
      {sections.map(s => {
        if (s.games.length === 0) return null;
        const shown = s.games.slice(0, 6);
        const remaining = s.games.length - shown.length;

        return (
          <section key={s.key} className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="sport-section-heading text-xl font-bold flex items-center gap-2">
                <span className="text-2xl leading-none">{s.emoji}</span>
                <span>{s.label} Tonight</span>
                <span className="text-sm font-normal text-gray-500">
                  {s.games.length} game{s.games.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <Link href={s.href} className="text-sm text-blue-400 hover:text-blue-300 transition-colors shrink-0">
                Full schedule →
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map(game => (
                <SportCard key={game.game_pk} game={game} />
              ))}
            </div>

            {remaining > 0 && (
              <Link
                href={s.href}
                className="mt-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors"
              >
                +{remaining} more {s.label} game{remaining !== 1 ? "s" : ""} →
              </Link>
            )}
          </section>
        );
      })}

      {totalTonight === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-2xl mb-2">No games tonight</p>
          <p className="text-sm mb-6">Check back tomorrow, or browse the full weekly schedule for each sport.</p>
          <div className="flex justify-center flex-wrap gap-4">
            {sections.map(s => (
              <Link key={s.key} href={s.href} className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                {s.emoji} {s.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── FAQ — AEO ── */}
      <section className="mt-16 border-t border-gray-800 pt-10">
        <h2 className="text-xl font-bold mb-6 text-gray-300">Frequently Asked Questions</h2>
        <div className="space-y-6 max-w-3xl">
          {[
            {
              q: "What sports are on TV tonight?",
              a: `On ${todayLabel} there ${totalTonight === 1 ? "is" : "are"} ${totalTonight || "no"} live sports game${totalTonight !== 1 ? "s" : ""} on TV${totalTonight > 0 ? `: ${tonightSummary}` : ""}. This page updates every hour with the latest broadcast info.`,
            },
            {
              q: "How do I watch sports without cable tonight?",
              a: "Stream tonight's games on ESPN+ (ESPN app), Peacock (NBC games), Amazon Prime Video (Thursday Night Football), Apple TV+ (MLB Friday Night Baseball, all MLS), Max (TNT/TBS games), and YouTube TV or Hulu Live TV for every major sports channel.",
            },
            {
              q: "What NFL games are on TV tonight?",
              a: "NFL games air on CBS (AFC), Fox (NFC), NBC (Sunday Night Football), ESPN/ABC (Monday Night Football), and Amazon Prime Video (Thursday Night Football). See the NFL section above for tonight's game, time, and channel.",
            },
            {
              q: "What NBA games are on TV tonight?",
              a: "NBA games air nationally on ESPN, ABC, TNT, and NBA TV. See the NBA section above for tonight's tip-off times and channels.",
            },
            {
              q: "What NHL games are on TV tonight?",
              a: "NHL games air on ESPN, ABC, TNT, TBS, truTV, and NHL Network. See the NHL section above for tonight's puck-drop times.",
            },
            {
              q: "What MLB games are on TV tonight?",
              a: "MLB games air on ESPN, Fox, FS1, and Apple TV+ (Friday Night Baseball). See the MLB section above for today's start times and streaming options.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-gray-800/60 pb-5 last:border-0">
              <h3 className="font-semibold text-white mb-1.5">{q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
