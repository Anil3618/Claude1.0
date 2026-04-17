"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Game } from "@/lib/types";

const START_HOUR = 9;  // 9 AM PT
const END_HOUR = 24;   // midnight PT
const CANVAS_H = 88;
const PAD_X = 20;
const PAD_TOP = 10;
const PAD_BOTTOM = 28;
const DOT_R = 7;

function toCtHour(utcString: string): number | null {
  if (!utcString) return null;
  try {
    const d = new Date(utcString);
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(d);
    const h = parseInt(parts.find(p => p.type === "hour")?.value ?? "0");
    const m = parseInt(parts.find(p => p.type === "minute")?.value ?? "0");
    return h + m / 60;
  } catch {
    return null;
  }
}

interface Dot {
  game: Game;
  cx: number; // canvas x
  cy: number; // canvas y
  color: string;
}

export function GameTimeline({ games }: { games: Game[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const [tooltip, setTooltip] = useState<{ game: Game; pageX: number; pageY: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const span = END_HOUR - START_HOUR;
    const trackY = PAD_TOP + (CANVAS_H - PAD_TOP - PAD_BOTTOM) / 2;
    const left = PAD_X;
    const right = W - PAD_X;
    const trackW = right - left;

    ctx.clearRect(0, 0, W, CANVAS_H);

    // Track line
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(left, trackY);
    ctx.lineTo(right, trackY);
    ctx.stroke();

    // Tick marks & hour labels (every odd hour)
    for (let h = START_HOUR; h <= END_HOUR; h++) {
      const x = left + ((h - START_HOUR) / span) * trackW;
      ctx.strokeStyle = "#4B5563";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, trackY - 5);
      ctx.lineTo(x, trackY + 5);
      ctx.stroke();

      if (h % 2 === 1 && h < 24) {
        const lbl = h < 12 ? `${h}a` : h === 12 ? "12p" : `${h - 12}p`;
        ctx.fillStyle = "#6B7280";
        ctx.font = "10px system-ui,sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(lbl, x, trackY + 20);
      }
    }

    // Game dots
    const dots: Dot[] = [];
    games.forEach(game => {
      const ctH = toCtHour(game.game_time_utc);
      if (ctH === null || ctH < START_HOUR || ctH > END_HOUR) return;
      const x = left + ((ctH - START_HOUR) / span) * trackW;
      const color = game.platforms[0]?.color ?? "#4B5563";

      // Glow ring
      ctx.beginPath();
      ctx.arc(x, trackY, DOT_R + 4, 0, Math.PI * 2);
      ctx.fillStyle = color + "2a";
      ctx.fill();

      // Filled dot
      ctx.beginPath();
      ctx.arc(x, trackY, DOT_R, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = "#0d1117";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      dots.push({ game, cx: x, cy: trackY, color });
    });
    dotsRef.current = dots;
  }, [games]);

  // Resize-aware canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = CANVAS_H;
      draw();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => ro.disconnect();
  }, [draw]);

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const hit = dotsRef.current.find(d => {
      const dx = mx - d.cx;
      const dy = my - d.cy;
      return Math.sqrt(dx * dx + dy * dy) <= DOT_R + 5;
    });

    if (hit) {
      setTooltip({ game: hit.game, pageX: e.clientX, pageY: e.clientY });
    } else {
      setTooltip(null);
    }
  }

  const timedGames = games.filter(g => g.game_time_utc);
  if (timedGames.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
        Today&rsquo;s Game Timeline · Pacific Time
      </p>
      <div
        ref={containerRef}
        className="bg-gray-900 border border-gray-800 rounded-xl px-1 py-1 overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          height={CANVAS_H}
          className="w-full cursor-crosshair select-none"
          onMouseMove={onMouseMove}
          onMouseLeave={() => setTooltip(null)}
        />
      </div>

      {/* Tooltip — fixed relative to cursor */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.pageX, top: tooltip.pageY - 14 }}
        >
          <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-2xl">
            <p className="font-bold text-white">
              {tooltip.game.away_team.abbreviation} @ {tooltip.game.home_team.abbreviation}
            </p>
            <p className="text-gray-400 mt-0.5">
              {new Date(tooltip.game.game_time_utc).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                timeZone: "America/Los_Angeles",
                timeZoneName: "short",
              })}
            </p>
            {tooltip.game.platforms[0] && (
              <p
                className="font-semibold mt-0.5"
                style={{ color: tooltip.game.platforms[0].color }}
              >
                {tooltip.game.platforms[0].label}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
