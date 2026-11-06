"use client";

import { PlatformBadge } from "./PlatformBadge";
import type { Game } from "@/lib/types";

const TODAY = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

// ESPN CDN logo by sport + abbreviation (lowercase)
function teamLogoUrl(sport: string, abbr: string): string {
  const slug = abbr.toLowerCase();
  const leagueMap: Record<string, string> = {
    nba: "nba", nhl: "nhl", wnba: "wnba", soccer: "soccer",
  };
  const league = leagueMap[sport] ?? sport;
  if (league === "soccer") {
    // MLS uses numeric IDs on ESPN CDN — fall back to initials placeholder
    return `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${slug}.png&h=48&w=48`;
  }
  return `https://a.espncdn.com/i/teamlogos/${league}/500/${slug}.png`;
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

const FANDUEL_URL    = "https://www.fanduel.com/sports";
const DRAFTKINGS_URL = "https://www.draftkings.com/lobby";

export function SportCard({ game }: { game: Game }) {
  const sport = game.sport ?? "nba";
  const accentColor = game.platforms[0]?.color ?? "#374151";
  const isFinal = game.status.toLowerCase().includes("final");
  const isLive  = game.status.toLowerCase().includes("progress") ||
                  game.status.toLowerCase().includes("live") ||
                  game.status.toLowerCase().includes("half") ||
                  game.status.toLowerCase().includes("period") ||
                  game.status.toLowerCase().includes("quarter");
  const isToday = game.game_date === TODAY;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: accentColor }} />

      <div className="pl-2">
        <div className="flex items-stretch justify-between mb-3 gap-2">
          {/* Teams */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Away */}
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogoUrl(sport, game.away_team.abbreviation)}
                alt={game.away_team.abbreviation} width={24} height={24}
                className="w-6 h-6 object-contain shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="font-semibold text-sm text-gray-200 leading-tight truncate">
                {game.away_team.name}
              </span>
            </div>
            <span className="text-gray-700 text-[10px] pl-8">vs</span>
            {/* Home */}
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={teamLogoUrl(sport, game.home_team.abbreviation)}
                alt={game.home_team.abbreviation} width={24} height={24}
                className="w-6 h-6 object-contain shrink-0"
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="font-semibold text-sm text-gray-200 leading-tight truncate">
                {game.home_team.name}
              </span>
            </div>
          </div>

          {/* Score / time */}
          <div className="shrink-0 flex items-center">
            {isFinal && game.away_score != null && game.home_score != null ? (
              <div className="flex flex-col items-end gap-0.5 min-w-[40px]">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-0.5">Final</span>
                <span className="text-lg font-bold tabular-nums text-gray-300 leading-none">{game.away_score}</span>
                <span className="text-lg font-bold tabular-nums text-gray-300 leading-none">{game.home_score}</span>
              </div>
            ) : isLive && game.away_score != null && game.home_score != null ? (
              <div className="flex flex-col items-end gap-0.5 min-w-[52px]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live</span>
                </div>
                <span className="text-lg font-bold tabular-nums text-white leading-none">{game.away_score}</span>
                <span className="text-lg font-bold tabular-nums text-white leading-none">{game.home_score}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{game.status}</span>
              </div>
            ) : (
              <span className="text-sm text-gray-300 font-medium whitespace-nowrap">
                {formatGameTime(game.game_time_utc)}
              </span>
            )}
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

        {/* Betting CTAs */}
        {!isFinal && isToday && (
          <div className="flex gap-2 mt-3">
            {isLive ? (
              <>
                <a href={FANDUEL_URL} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Bet Live · FanDuel
                </a>
                <a href={DRAFTKINGS_URL} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-semibold hover:bg-red-500/20 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Bet Live · DK
                </a>
              </>
            ) : (
              <>
                <a href={FANDUEL_URL} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1493ff]/10 border border-[#1493ff]/25 text-[#1493ff] text-[11px] font-semibold hover:bg-[#1493ff]/20 transition-colors">
                  FanDuel
                  <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
                <a href={DRAFTKINGS_URL} target="_blank" rel="noopener noreferrer sponsored"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#53d337]/10 border border-[#53d337]/25 text-[#53d337] text-[11px] font-semibold hover:bg-[#53d337]/20 transition-colors">
                  DraftKings
                  <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                  </svg>
                </a>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
