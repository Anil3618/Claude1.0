import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Map our MLB abbreviations to Kalshi's ticker fragments
// Kalshi uses full city/team names in titles; we match by searching title text
const TEAM_NAMES: Record<string, string[]> = {
  BAL: ["Baltimore", "Orioles"],
  BOS: ["Boston", "Red Sox"],
  NYY: ["Yankees", "New York Y"],
  TB:  ["Tampa Bay", "Rays"],
  TOR: ["Toronto", "Blue Jays"],
  CWS: ["White Sox", "Chicago W"],
  CLE: ["Cleveland", "Guardians"],
  DET: ["Detroit", "Tigers"],
  KC:  ["Kansas City", "Royals"],
  MIN: ["Minnesota", "Twins"],
  HOU: ["Houston", "Astros"],
  LAA: ["Angels", "Los Angeles A"],
  ATH: ["Athletics", "Oakland"],
  SEA: ["Seattle", "Mariners"],
  TEX: ["Texas", "Rangers"],
  ATL: ["Atlanta", "Braves"],
  MIA: ["Miami", "Marlins"],
  NYM: ["Mets", "New York M"],
  PHI: ["Philadelphia", "Phillies"],
  WSH: ["Washington", "Nationals"],
  CHC: ["Cubs", "Chicago C"],
  CIN: ["Cincinnati", "Reds"],
  MIL: ["Milwaukee", "Brewers"],
  PIT: ["Pittsburgh", "Pirates"],
  STL: ["St. Louis", "Cardinals"],
  ARI: ["Arizona", "Diamondbacks"],
  COL: ["Colorado", "Rockies"],
  LAD: ["Dodgers", "Los Angeles D"],
  SD:  ["San Diego", "Padres"],
  SF:  ["San Francisco", "Giants"],
};

interface KalshiMarket {
  ticker: string;
  title: string;
  yes_bid: number;
  yes_ask: number;
  last_price: number;
  status: string;
  event_ticker?: string;
}

export interface KalshiResult {
  homeProb: number;
  awayProb: number;
  homeTicker: string;
  awayTicker: string;
  marketUrl: string;
}

const cache = new Map<string, KalshiResult | null>();

function matchesTeam(title: string, abbr: string): boolean {
  const names = TEAM_NAMES[abbr] ?? [abbr];
  const lower = title.toLowerCase();
  return names.some(n => lower.includes(n.toLowerCase()));
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gamePk: string }> }
) {
  const { gamePk } = await params;

  if (cache.has(gamePk)) {
    const cached = cache.get(gamePk);
    return NextResponse.json(cached ?? null, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  }

  const url = new URL(request.url);
  const home = url.searchParams.get("home") ?? "";
  const away = url.searchParams.get("away") ?? "";
  const date = url.searchParams.get("date") ?? ""; // YYYY-MM-DD

  try {
    // Kalshi public REST API — no auth required for reading market prices
    // Try KXMLB series first (Kalshi's MLB series ticker)
    const res = await fetch(
      `https://trading-api.kalshi.com/trade-api/v2/markets` +
      `?status=open&limit=200&series_ticker=KXMLB`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    const data = await res.json();
    const markets: KalshiMarket[] = data.markets ?? [];

    // Filter to today's date — Kalshi tickers often embed date as YYYYMMDD
    const dateCompact = date.replace(/-/g, ""); // "20260515"

    // Find a market for the home team win in this game
    const homeMarket = markets.find(m => {
      const hasDate = !dateCompact || m.ticker.includes(dateCompact) || m.event_ticker?.includes(dateCompact);
      return hasDate && matchesTeam(m.title, home);
    });

    if (!homeMarket) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    // Midpoint of bid/ask in cents (0–100) = implied probability %
    const homeProb = Math.round((homeMarket.yes_bid + homeMarket.yes_ask) / 2);

    const result: KalshiResult = {
      homeProb,
      awayProb: 100 - homeProb,
      homeTicker: home,
      awayTicker: away,
      marketUrl: `https://kalshi.com/markets/${homeMarket.ticker}`,
    };

    cache.set(gamePk, result);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    cache.set(gamePk, null);
    return NextResponse.json(null);
  }
}
