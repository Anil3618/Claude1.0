import { PlatformBadge } from "./PlatformBadge";
import type { Game } from "@/lib/types";

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

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
      {/* Teams */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-base">{game.away_team.name}</span>
          <span className="text-gray-500 text-xs">@</span>
          <span className="font-semibold text-base">{game.home_team.name}</span>
        </div>
        <div className="text-right">
          {isLive ? (
            <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium animate-pulse">
              LIVE
            </span>
          ) : isFinal ? (
            <span className="text-xs text-gray-500 font-medium">Final</span>
          ) : (
            <span className="text-sm text-gray-300 font-medium">
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
  );
}
