import { PlatformBadge } from "./PlatformBadge";
import { LiveScore } from "./LiveScore";
import type { Game } from "@/lib/types";
import { MLB_LEAGUES, teamLogoUrl } from "@/lib/mlb-teams";

// Build a flat id→espnSlug lookup once at module level
const TEAM_LOGO: Record<number, string> = Object.fromEntries(
  MLB_LEAGUES.flatMap(l => l.divisions.flatMap(d => d.teams)).map(t => [t.id, t.espnSlug])
);

interface Props {
  game: Game;
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
  const isLive = game.status.toLowerCase().includes("live") ||
                 game.status.toLowerCase().includes("progress");
  const isFinal = game.status.toLowerCase().includes("final");
  const accentColor = game.platforms[0]?.color ?? "#374151";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors relative overflow-hidden">
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
        style={{ backgroundColor: accentColor }}
      />

      <div className="pl-2">
        {/* Teams + score/status row */}
        <div className="flex items-stretch justify-between mb-3 gap-2">
          {/* Team names */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Away */}
            <div className="flex items-center gap-2">
              {TEAM_LOGO[game.away_team.id] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teamLogoUrl(TEAM_LOGO[game.away_team.id])}
                  alt={game.away_team.abbreviation}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain shrink-0"
                />
              )}
              <span className="font-semibold text-sm text-gray-200 leading-tight truncate">
                {game.away_team.name}
              </span>
            </div>
            <span className="text-gray-700 text-[10px] pl-8">vs</span>
            {/* Home */}
            <div className="flex items-center gap-2">
              {TEAM_LOGO[game.home_team.id] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teamLogoUrl(TEAM_LOGO[game.home_team.id])}
                  alt={game.home_team.abbreviation}
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain shrink-0"
                />
              )}
              <span className="font-semibold text-sm text-gray-200 leading-tight truncate">
                {game.home_team.name}
              </span>
            </div>
          </div>

          {/* Status / score column */}
          <div className="shrink-0 flex items-center">
            {isLive ? (
              <LiveScore gamePk={game.game_pk} />
            ) : isFinal ? (
              <span className="text-xs text-gray-500 font-medium">Final</span>
            ) : (
              <span className="text-sm text-gray-300 font-medium whitespace-nowrap">
                {formatGameTime(game.game_time_utc)}
              </span>
            )}
          </div>
        </div>

        {/* Venue */}
        {game.venue && (
          <p className="text-xs text-gray-600 mb-3">{game.venue}</p>
        )}

        {/* Platforms */}
        {game.platforms.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {game.platforms.map((p) => (
              <PlatformBadge key={p.label} platform={p} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600 italic">
            Broadcast info not yet available
          </p>
        )}
      </div>
    </div>
  );
}
