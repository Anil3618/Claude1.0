"use client";

import { useMemo } from "react";
import { SportCard } from "./SportCard";
import type { Game, ScheduleData } from "@/lib/types";

interface Props {
  schedule: ScheduleData;
  today: string;
}

function formatDateHeading(dateStr: string, today: string): string {
  const d = new Date(today + "T12:00:00");
  d.setDate(d.getDate() + 1);
  const tomorrow = d.toLocaleDateString("en-CA");
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}

export function SportScheduleView({ schedule, today }: Props) {
  const yesterday = useMemo(() => {
    const d = new Date(today + "T12:00:00");
    d.setDate(d.getDate() - 1);
    return d.toLocaleDateString("en-CA");
  }, [today]);

  const sortedDates = Object.keys(schedule.dates).sort();
  const todayGames: Game[]     = schedule.dates[today] ?? [];
  const yesterdayGames: Game[] = (schedule.dates[yesterday] ?? []).filter(
    g => g.status.toLowerCase().includes("final")
  );
  const upcomingDates = sortedDates.filter(d => d > today).slice(0, 3);

  return (
    <>
      {/* Stats strip */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-col">
          <span className="text-2xl font-bold text-white">{todayGames.length}</span>
          <span className="text-xs text-gray-500 mt-0.5">Games today</span>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex flex-col">
          <span className="text-2xl font-bold text-white">{schedule.game_count}</span>
          <span className="text-xs text-gray-500 mt-0.5">Games this week</span>
        </div>
      </div>

      {/* Today */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold text-gray-300 mb-4 uppercase tracking-wide">
          Today · {today}
        </h2>
        {todayGames.length === 0 ? (
          <p className="text-gray-500">No games scheduled today.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {todayGames.map(game => <SportCard key={game.game_pk} game={game} />)}
          </div>
        )}
      </section>

      {/* Upcoming */}
      {upcomingDates.map(dateStr => (
        <section key={dateStr} className="mb-10">
          <h2 className="text-xs font-semibold text-gray-300 mb-4 uppercase tracking-wide">
            {formatDateHeading(dateStr, today)} · {dateStr}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(schedule.dates[dateStr] ?? []).map(game => (
              <SportCard key={game.game_pk} game={game} />
            ))}
          </div>
        </section>
      ))}

      {/* Yesterday results */}
      {yesterdayGames.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wide flex items-center gap-2">
            Yesterday · {yesterday}
            <span className="text-gray-700 font-normal normal-case tracking-normal text-[10px]">Final results</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {yesterdayGames.map(game => <SportCard key={game.game_pk} game={game} />)}
          </div>
        </section>
      )}

      {sortedDates.length === 0 && (
        <p className="text-gray-500 py-10 text-center">No games found this week.</p>
      )}
    </>
  );
}
