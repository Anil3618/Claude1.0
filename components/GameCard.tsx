"use client";

import { useState, useEffect, useCallback } from "react";
import { PlatformBadge } from "./PlatformBadge";
import type { Game } from "@/lib/types";
import { MLB_LEAGUES, teamLogoUrl } from "@/lib/mlb-teams";

const TEAM_LOGO: Record<number, string> = Object.fromEntries(
  MLB_LEAGUES.flatMap(l => l.divisions.flatMap(d => d.teams)).map(t => [t.id, t.espnSlug])
);

const TODAY = new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });

interface Props {
  game: Game;
}

interface LiveData {
  awayRuns: number;
  homeRuns: number;
  // Live-only fields (undefined when final)
  inningOrdinal?: string;
  isTop?: boolean;
  outs?: number;
}

function formatGameTime(utcString: string): string {
  if (!utcString) return "TBD";
  try {
    return new Date(utcString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "America/Chicago",
      timeZoneName: "short",
    });
  } catch {
    return "TBD";
  }
}

export function GameCard({ game }: Props) {
  const accentColor = game.platforms[0]?.color ?? "#374151";

  // Seed from static JSON — upgraded to real-time below for today's games
  const seedLive = game.status.toLowerCase().includes("live") ||
                   game.status.toLowerCase().includes("progress");
  const seedFinal = game.status.toLowerCase().includes("final");

  const [phase, setPhase] = useState<"scheduled" | "live" | "final">(
    seedLive ? "live" : seedFinal ? "final" : "scheduled"
  );
  const [live, setLive] = useState<LiveData | null>(null);

  const isToday = game.game_date === TODAY;
  const startTime = game.game_time_utc ? new Date(game.game_time_utc) : null;
  const startedOrFinal = isToday && !!startTime && new Date() >= startTime;

  // Poll only while the game hasn't finished
  const shouldPoll = startedOrFinal && phase !== "final";
  // One-time fetch for games already marked final in the static JSON (to get the score)
  const shouldFetchFinalScore = isToday && seedFinal && live === null;

  const poll = useCallback(async () => {
    try {
      const url =
        `https://statsapi.mlb.com/api/v1.1/game/${game.game_pk}/feed/live` +
        `?fields=gameData,status,abstractGameState,liveData,linescore,` +
        `currentInning,currentInningOrdinal,isTopInning,teams,home,away,runs,outs`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      const state: string = json?.gameData?.status?.abstractGameState ?? "";
      const ls = json?.liveData?.linescore;

      if (state === "Live" && ls) {
        setPhase("live");
        setLive({
          awayRuns:      ls.teams?.away?.runs    ?? 0,
          homeRuns:      ls.teams?.home?.runs    ?? 0,
          inningOrdinal: ls.currentInningOrdinal ?? "",
          isTop:         ls.isTopInning          ?? true,
          outs:          ls.outs                 ?? 0,
        });
      } else if (state === "Final") {
        setPhase("final");
        // Capture final score (inning/outs not needed)
        if (ls) {
          setLive({
            awayRuns: ls.teams?.away?.runs ?? 0,
            homeRuns: ls.teams?.home?.runs ?? 0,
          });
        }
      }
    } catch {
      // network error — leave current state unchanged
    }
  }, [game.game_pk]);

  // Interval poll for live games
  useEffect(() => {
    if (!shouldPoll) return;
    poll();
    const id = setInterval(poll, 30_000);
    return () => clearInterval(id);
  }, [shouldPoll, poll]);

  // One-time fetch for games already final in static JSON
  useEffect(() => {
    if (shouldFetchFinalScore) poll();
  }, [shouldFetchFinalScore, poll]);

  // ── Status column ─────────────────────────────────────────────────
  function StatusColumn() {
    if (phase === "live" && live) {
      return (
        <div className="flex flex-col items-end gap-0.5 min-w-[52px]">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live</span>
          </div>
          <span className="text-lg font-bold tabular-nums text-white leading-none">{live.awayRuns}</span>
          <span className="text-lg font-bold tabular-nums text-white leading-none">{live.homeRuns}</span>
          <div className="text-[10px] text-gray-400 mt-1 text-right leading-tight">
            <div>{live.isTop ? "▲" : "▼"} {live.inningOrdinal}</div>
            <div>{live.outs} {live.outs === 1 ? "out" : "outs"}</div>
          </div>
        </div>
      );
    }
    if (phase === "live" && !live) {
      // Waiting for first score fetch
      return (
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live</span>
        </div>
      );
    }
    if (phase === "final") {
      return (
        <div className="flex flex-col items-end gap-0.5 min-w-[52px]">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">
            Final
          </span>
          {live ? (
            <>
              <span className="text-lg font-bold tabular-nums text-gray-300 leading-none">{live.awayRuns}</span>
              <span className="text-lg font-bold tabular-nums text-gray-300 leading-none">{live.homeRuns}</span>
            </>
          ) : null}
        </div>
      );
    }
    return (
      <span className="text-sm text-gray-300 font-medium whitespace-nowrap">
        {formatGameTime(game.game_time_utc)}
      </span>
    );
  }
  // ─────────────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: accentColor }} />

      <div className="pl-2">
        <div className="flex items-stretch justify-between mb-3 gap-2">
          {/* Team names */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {[game.away_team, game.home_team].map((team, i) => (
              i === 1
                ? <div key="vs" className="flex flex-col gap-2">
                    <span className="text-gray-700 text-[10px] pl-8">vs</span>
                    <div className="flex items-center gap-2">
                      {TEAM_LOGO[team.id] && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={teamLogoUrl(TEAM_LOGO[team.id])} alt={team.abbreviation}
                          width={24} height={24} className="w-6 h-6 object-contain shrink-0" />
                      )}
                      <span className="font-semibold text-sm text-gray-200 leading-tight truncate">{team.name}</span>
                    </div>
                  </div>
                : <div key="away" className="flex items-center gap-2">
                    {TEAM_LOGO[team.id] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={teamLogoUrl(TEAM_LOGO[team.id])} alt={team.abbreviation}
                        width={24} height={24} className="w-6 h-6 object-contain shrink-0" />
                    )}
                    <span className="font-semibold text-sm text-gray-200 leading-tight truncate">{team.name}</span>
                  </div>
            ))}
          </div>

          {/* Live score / time / final */}
          <div className="shrink-0 flex items-center">
            <StatusColumn />
          </div>
        </div>

        {game.venue && <p className="text-xs text-gray-600 mb-3">{game.venue}</p>}

        {game.platforms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {game.platforms.map(p => <PlatformBadge key={p.label} platform={p} />)}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic">Broadcast info not yet available</p>
        )}
      </div>
    </div>
  );
}
