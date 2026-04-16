"use client";

import { useState, useMemo } from "react";
import { GameCard } from "./GameCard";
import { GameTimeline } from "./GameTimeline";
import type { Game, ScheduleData } from "@/lib/types";
import { MLB_LEAGUES, teamLogoUrl } from "@/lib/mlb-teams";

interface Props {
  schedule: ScheduleData;
  today: string;
}

function formatDateHeading(dateStr: string, today: string): string {
  const tomorrow = new Date(today + "T12:00:00");
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("en-CA");

  if (dateStr === today) return "Today";
  if (dateStr === tomorrowStr) return "Tomorrow";
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export function ScheduleView({ schedule, today }: Props) {
  const [activeLeague, setActiveLeague] = useState<"AL" | "NL" | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // All team IDs appearing in this week's schedule
  const activeTeamIds = useMemo(() => {
    const ids = new Set<number>();
    for (const games of Object.values(schedule.dates)) {
      for (const game of games) {
        ids.add(game.home_team.id);
        ids.add(game.away_team.id);
      }
    }
    return ids;
  }, [schedule]);

  function handleLeagueClick(league: "AL" | "NL") {
    if (activeLeague === league) {
      // Collapse — clear everything
      setActiveLeague(null);
      setSelectedTeamId(null);
    } else {
      setActiveLeague(league);
      setSelectedTeamId(null);
    }
  }

  function handleTeamClick(teamId: number) {
    setSelectedTeamId(prev => prev === teamId ? null : teamId);
  }

  // Filter games by selected team (or show all)
  const filteredDates = useMemo(() => {
    if (!selectedTeamId) return schedule.dates;
    const result: Record<string, Game[]> = {};
    for (const [date, games] of Object.entries(schedule.dates)) {
      const filtered = games.filter(
        g => g.home_team.id === selectedTeamId || g.away_team.id === selectedTeamId
      );
      if (filtered.length > 0) result[date] = filtered;
    }
    return result;
  }, [schedule, selectedTeamId]);

  const sortedDates = Object.keys(filteredDates).sort();
  const todayGames: Game[] = filteredDates[today] ?? [];
  const upcomingDates = sortedDates.filter(d => d > today).slice(0, 3);

  const selectedLeagueData = MLB_LEAGUES.find(l => l.short === activeLeague);

  // Resolve selected team name for the heading
  const selectedTeam = selectedTeamId
    ? MLB_LEAGUES.flatMap(l => l.divisions.flatMap(d => d.teams)).find(t => t.id === selectedTeamId)
    : null;

  return (
    <>
      {/* League / Team Filter */}
      <section className="mb-8">
        {/* League toggle buttons */}
        <div className="flex gap-3 mb-4">
          {MLB_LEAGUES.map(league => (
            <button
              key={league.short}
              onClick={() => handleLeagueClick(league.short)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                activeLeague === league.short
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-gray-900 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
              }`}
            >
              {league.name}
            </button>
          ))}
          {selectedTeamId && (
            <button
              onClick={() => { setSelectedTeamId(null); setActiveLeague(null); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-700 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              All Games
            </button>
          )}
        </div>

        {/* Team list — only shown when a league is selected */}
        {activeLeague && selectedLeagueData && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="space-y-4">
              {selectedLeagueData.divisions.map(division => {
                // Only show teams playing this week
                const playingTeams = division.teams.filter(t => activeTeamIds.has(t.id));
                if (playingTeams.length === 0) return null;
                return (
                  <div key={division.name}>
                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-medium">
                      {division.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {playingTeams.map(team => (
                        <button
                          key={team.id}
                          onClick={() => handleTeamClick(team.id)}
                          title={team.name}
                          className={`flex flex-col items-center gap-1 w-16 py-2 rounded-xl transition-all border ${
                            selectedTeamId === team.id
                              ? "bg-blue-600/20 border-blue-500 ring-1 ring-blue-500"
                              : "bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={teamLogoUrl(team.espnSlug)}
                            alt={team.abbreviation}
                            width={32}
                            height={32}
                            className="w-8 h-8 object-contain"
                          />
                          <span className={`text-xs font-bold leading-none ${
                            selectedTeamId === team.id ? "text-blue-300" : "text-gray-400"
                          }`}>
                            {team.abbreviation}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Active filter label */}
      {selectedTeam && (
        <p className="text-sm text-blue-400 mb-6 font-medium">
          Showing games for the {selectedTeam.name}
        </p>
      )}

      {/* Stats strip */}
      {!selectedTeamId && (() => {
        const todayCount = (schedule.dates[today] ?? []).length;
        const allPlatforms = new Set(
          Object.values(schedule.dates).flat().flatMap(g => g.platforms.map(p => p.label))
        );
        return (
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-col">
              <span className="text-2xl font-bold text-white">{todayCount}</span>
              <span className="text-xs text-gray-500 mt-0.5">Games today</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-col">
              <span className="text-2xl font-bold text-white">{schedule.game_count}</span>
              <span className="text-xs text-gray-500 mt-0.5">Games this week</span>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-col">
              <span className="text-2xl font-bold text-white">{allPlatforms.size}</span>
              <span className="text-xs text-gray-500 mt-0.5">Platforms</span>
            </div>
          </div>
        );
      })()}

      {/* Canvas timeline — today only */}
      {todayGames.length > 0 && <GameTimeline games={todayGames} />}

      {/* Today */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold text-gray-300 mb-4 uppercase tracking-wide">
          Today · {today}
        </h2>
        {todayGames.length === 0 ? (
          <p className="text-gray-500">
            {selectedTeam ? `No games today for ${selectedTeam.name}.` : "No games scheduled today."}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {todayGames.map(game => (
              <GameCard key={game.game_pk} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcomingDates.map(dateStr => {
        const games: Game[] = filteredDates[dateStr] ?? [];
        return (
          <section key={dateStr} className="mb-10">
            <h2 className="text-xs font-semibold text-gray-300 mb-4 uppercase tracking-wide">
              {formatDateHeading(dateStr, today)} · {dateStr}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {games.map(game => (
                <GameCard key={game.game_pk} game={game} />
              ))}
            </div>
          </section>
        );
      })}

      {sortedDates.length === 0 && (
        <p className="text-gray-500 py-10 text-center">
          No games found{selectedTeam ? ` for the ${selectedTeam.name}` : ""} this week.
        </p>
      )}
    </>
  );
}
