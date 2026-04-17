"use client";

import { useState, useMemo } from "react";
import { MLB_LEAGUES, teamLogoUrl } from "@/lib/mlb-teams";
import { GameCard } from "./GameCard";
import type { Game, ScheduleData } from "@/lib/types";

interface Props {
  schedule: ScheduleData;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });
  const tomorrow = new Date(today + "T12:00:00");
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("en-CA");
  if (dateStr === today) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

const ALL_TEAMS = MLB_LEAGUES.flatMap(l =>
  l.divisions.flatMap(d => d.teams.map(t => ({ ...t, league: l.short, division: d.name })))
);

export function TeamSearch({ schedule }: Props) {
  const [query, setQuery] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Team IDs with games this week
  const activeTeamIds = useMemo(() => {
    const ids = new Set<number>();
    for (const games of Object.values(schedule.dates))
      for (const g of games) { ids.add(g.home_team.id); ids.add(g.away_team.id); }
    return ids;
  }, [schedule]);

  // Filter teams by search query
  const filteredTeams = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL_TEAMS;
    return ALL_TEAMS.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.abbreviation.toLowerCase().includes(q) ||
      t.espnSlug.includes(q) ||
      t.division.toLowerCase().includes(q) ||
      t.league.toLowerCase() === q
    );
  }, [query]);

  // Games this week for the selected team
  const teamGames = useMemo((): Record<string, Game[]> => {
    if (!selectedTeamId) return {};
    const out: Record<string, Game[]> = {};
    for (const [date, games] of Object.entries(schedule.dates)) {
      const g = games.filter(g => g.home_team.id === selectedTeamId || g.away_team.id === selectedTeamId);
      if (g.length) out[date] = g;
    }
    return out;
  }, [schedule, selectedTeamId]);

  const selectedTeam = ALL_TEAMS.find(t => t.id === selectedTeamId);

  function handleTeamClick(id: number) {
    setSelectedTeamId(prev => (prev === id ? null : id));
  }

  return (
    <>
      {/* Search input */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          placeholder="Search by team name, abbreviation, or division…"
          value={query}
          onChange={e => { setQuery(e.target.value); setSelectedTeamId(null); }}
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/40 transition-colors text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setSelectedTeamId(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Team grid */}
      {filteredTeams.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No teams match &ldquo;{query}&rdquo;</p>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-10 gap-2 mb-8">
          {filteredTeams.map(team => {
            const hasGames = activeTeamIds.has(team.id);
            const isSelected = selectedTeamId === team.id;
            return (
              <button
                key={team.id}
                onClick={() => handleTeamClick(team.id)}
                title={`${team.name}${!hasGames ? " — No games this week" : ""}`}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${
                  isSelected
                    ? "bg-blue-600/20 border-blue-500 ring-1 ring-blue-500"
                    : hasGames
                    ? "bg-gray-900 border-gray-700 hover:border-gray-500 hover:bg-gray-800 cursor-pointer"
                    : "bg-gray-950 border-gray-800 opacity-35 cursor-default"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teamLogoUrl(team.espnSlug)}
                  alt={team.abbreviation}
                  width={40}
                  height={40}
                  className="w-9 h-9 object-contain"
                />
                <span className={`text-[9px] font-bold leading-none tracking-wide ${
                  isSelected ? "text-blue-300" : "text-gray-500"
                }`}>
                  {team.abbreviation}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Hint when nothing selected */}
      {!selectedTeam && filteredTeams.length > 0 && (
        <p className="text-gray-600 text-sm text-center py-4">
          Select a team to see their games this week
        </p>
      )}

      {/* Selected team schedule */}
      {selectedTeam && (
        <section>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={teamLogoUrl(selectedTeam.espnSlug)}
              alt={selectedTeam.name}
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
            <div>
              <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
              <p className="text-xs text-gray-500">{selectedTeam.division}</p>
            </div>
          </div>

          {Object.keys(teamGames).length === 0 ? (
            <p className="text-gray-500">No games scheduled this week.</p>
          ) : (
            Object.entries(teamGames)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, games]) => (
                <div key={date} className="mb-8">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                    {formatDate(date)} · {date}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {games.map(g => <GameCard key={g.game_pk} game={g} />)}
                  </div>
                </div>
              ))
          )}
        </section>
      )}
    </>
  );
}
