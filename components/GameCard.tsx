"use client";

import { useState, useEffect, useCallback } from "react";
import { PlatformBadge } from "./PlatformBadge";
import type { Game } from "@/lib/types";
import { MLB_LEAGUES, teamLogoUrl } from "@/lib/mlb-teams";

const TEAM_LOGO: Record<number, string> = Object.fromEntries(
  MLB_LEAGUES.flatMap(l => l.divisions.flatMap(d => d.teams)).map(t => [t.id, t.espnSlug])
);

const TODAY = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

interface Props {
  game: Game;
}

interface HighlightResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

interface OddsResult {
  homeProb: number;
  awayProb: number;
  homeOdds: number;
  awayOdds: number;
  bookmaker: string;
}

// Placeholder affiliate URLs — replace with your tracked links from FanDuel/DraftKings affiliate portals
const FANDUEL_MLB_URL   = "https://www.fanduel.com/sports/mlb";
const DRAFTKINGS_MLB_URL = "https://www.draftkings.com/sports/baseball";
const DRAFTKINGS_DFS_URL = "https://www.draftkings.com/lobby#/MLB/1";

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
      timeZone: "America/Los_Angeles",
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
  const [highlight, setHighlight] = useState<HighlightResult | null>(null);
  const [odds, setOdds] = useState<OddsResult | null>(null);

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

  // Fetch moneyline win probabilities for today's scheduled/live games
  useEffect(() => {
    if (!isToday || phase === "final") return;
    const params = new URLSearchParams({
      home: game.home_team.abbreviation,
      away: game.away_team.abbreviation,
    });
    fetch(`/api/odds/${game.game_pk}?${params}`)
      .then(r => r.json())
      .then(data => { if (data?.homeProb) setOdds(data); })
      .catch(() => {});
  }, [isToday, phase, game.game_pk, game.home_team.abbreviation, game.away_team.abbreviation]);

  // Fetch highlight thumbnail when game is final
  useEffect(() => {
    if (phase !== "final") return;
    const params = new URLSearchParams({
      away: game.away_team.abbreviation,
      home: game.home_team.abbreviation,
      date: game.game_date,
    });
    fetch(`/api/highlights/${game.game_pk}?${params}`)
      .then(r => r.json())
      .then(data => { if (data?.videoId) setHighlight(data); })
      .catch(() => {});
  }, [phase, game.game_pk, game.away_team.abbreviation, game.home_team.abbreviation, game.game_date]);

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

        {/* Moneyline win-probability bar — today's scheduled/live games only */}
        {odds && phase !== "final" && (
          <div className="flex items-center gap-2 mb-3" title={`Win probability via ${odds.bookmaker} moneyline`}>
            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest shrink-0">Odds</span>
            <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
                style={{ width: `${odds.homeProb}%` }}
              />
            </div>
            <span className="text-[10px] tabular-nums shrink-0 text-gray-500">
              <span className="text-gray-400">{game.away_team.abbreviation}</span>
              {" "}{odds.awayOdds > 0 ? `+${odds.awayOdds}` : odds.awayOdds}
              <span className="text-gray-700 mx-1.5">·</span>
              <span className="text-gray-300">{game.home_team.abbreviation}</span>
              {" "}{odds.homeOdds > 0 ? `+${odds.homeOdds}` : odds.homeOdds}
            </span>
          </div>
        )}

        {game.platforms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {game.platforms.map(p => <PlatformBadge key={p.label} platform={p} />)}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic">Broadcast info not yet available</p>
        )}

        {/* Phase-aware betting CTAs */}
        {phase === "scheduled" && (
          <div className="flex gap-2 mt-3">
            <a
              href={FANDUEL_MLB_URL}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1493ff]/10 border border-[#1493ff]/25 text-[#1493ff] text-[11px] font-semibold hover:bg-[#1493ff]/20 transition-colors"
            >
              FanDuel
              <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <a
              href={DRAFTKINGS_MLB_URL}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#53d337]/10 border border-[#53d337]/25 text-[#53d337] text-[11px] font-semibold hover:bg-[#53d337]/20 transition-colors"
            >
              DraftKings
              <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}
        {phase === "live" && (
          <div className="flex gap-2 mt-3">
            <a
              href={FANDUEL_MLB_URL}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Bet Live · FanDuel
            </a>
            <a
              href={DRAFTKINGS_MLB_URL}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              Bet Live · DK
            </a>
          </div>
        )}
        {phase === "final" && (
          <a
            href={DRAFTKINGS_DFS_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#53d337]/10 border border-[#53d337]/25 text-[#53d337] text-[11px] font-semibold hover:bg-[#53d337]/20 transition-colors w-fit"
          >
            Play DFS Tomorrow · DraftKings
            <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}

        {phase === "final" && highlight && (
          <a
            href={`https://www.youtube.com/watch?v=${highlight.videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-lg overflow-hidden relative group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={highlight.thumbnail} alt={highlight.title}
              className="w-full h-28 object-cover" />
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-[10px] text-white/80 truncate">{highlight.title}</p>
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
