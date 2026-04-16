"use client";

import { useState, useEffect, useCallback } from "react";

interface Score {
  awayRuns: number;
  homeRuns: number;
  inningOrdinal: string;
  isTop: boolean;
  outs: number;
}

interface Props {
  gamePk: number;
}

export function LiveScore({ gamePk }: Props) {
  const [score, setScore] = useState<Score | null>(null);

  const fetchScore = useCallback(async () => {
    try {
      const url =
        `https://statsapi.mlb.com/api/v1.1/game/${gamePk}/feed/live` +
        `?fields=liveData,linescore,currentInning,currentInningOrdinal,isTopInning,teams,home,away,runs,outs`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const ls = data?.liveData?.linescore;
      if (!ls) return;
      setScore({
        awayRuns:      ls.teams?.away?.runs  ?? 0,
        homeRuns:      ls.teams?.home?.runs  ?? 0,
        inningOrdinal: ls.currentInningOrdinal ?? "",
        isTop:         ls.isTopInning         ?? true,
        outs:          ls.outs                ?? 0,
      });
    } catch {
      // silently ignore — LIVE badge still shows
    }
  }, [gamePk]);

  useEffect(() => {
    fetchScore();
    const id = setInterval(fetchScore, 30_000);
    return () => clearInterval(id);
  }, [fetchScore]);

  if (!score) {
    // Show pulsing dot only until first fetch resolves
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-bold text-red-400 uppercase tracking-wide">Live</span>
        </div>
      </div>
    );
  }

  const halfInning = score.isTop ? "▲" : "▼";

  return (
    <div className="flex flex-col items-end gap-0.5 min-w-[56px]">
      {/* Live indicator */}
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Live</span>
      </div>

      {/* Away score */}
      <span className="text-lg font-bold tabular-nums text-white leading-none">
        {score.awayRuns}
      </span>

      {/* Home score */}
      <span className="text-lg font-bold tabular-nums text-white leading-none">
        {score.homeRuns}
      </span>

      {/* Inning + outs */}
      <div className="text-[10px] text-gray-400 mt-1 text-right leading-tight">
        <div>{halfInning} {score.inningOrdinal}</div>
        <div>{score.outs} {score.outs === 1 ? "out" : "outs"}</div>
      </div>
    </div>
  );
}
