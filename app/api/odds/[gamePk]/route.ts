import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ODDS_API_KEY = process.env.ODDS_API_KEY;

// The Odds API full team names — must match their spelling exactly
const TEAM_FULL_NAMES: Record<string, string> = {
  BAL: "Baltimore Orioles",
  BOS: "Boston Red Sox",
  NYY: "New York Yankees",
  TB:  "Tampa Bay Rays",
  TOR: "Toronto Blue Jays",
  CWS: "Chicago White Sox",
  CLE: "Cleveland Guardians",
  DET: "Detroit Tigers",
  KC:  "Kansas City Royals",
  MIN: "Minnesota Twins",
  HOU: "Houston Astros",
  LAA: "Los Angeles Angels",
  ATH: "Oakland Athletics",
  SEA: "Seattle Mariners",
  TEX: "Texas Rangers",
  ATL: "Atlanta Braves",
  MIA: "Miami Marlins",
  NYM: "New York Mets",
  PHI: "Philadelphia Phillies",
  WSH: "Washington Nationals",
  CHC: "Chicago Cubs",
  CIN: "Cincinnati Reds",
  MIL: "Milwaukee Brewers",
  PIT: "Pittsburgh Pirates",
  STL: "St. Louis Cardinals",
  ARI: "Arizona Diamondbacks",
  COL: "Colorado Rockies",
  LAD: "Los Angeles Dodgers",
  SD:  "San Diego Padres",
  SF:  "San Francisco Giants",
};

export interface OddsResult {
  homeProb: number; // 0–100 implied probability (vig removed)
  awayProb: number;
  homeOdds: number; // raw American odds
  awayOdds: number;
  bookmaker: string;
}

// American odds → raw implied probability (before vig removal)
function toImplied(american: number): number {
  return american < 0
    ? (-american) / (-american + 100)
    : 100 / (american + 100);
}

const cache = new Map<string, OddsResult | null>();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gamePk: string }> }
) {
  const { gamePk } = await params;

  if (!ODDS_API_KEY) return NextResponse.json(null);

  if (cache.has(gamePk)) {
    return NextResponse.json(cache.get(gamePk) ?? null, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  }

  const url = new URL(request.url);
  const home = url.searchParams.get("home") ?? "";
  const away = url.searchParams.get("away") ?? "";

  const homeFull = TEAM_FULL_NAMES[home] ?? home;
  const awayFull = TEAM_FULL_NAMES[away] ?? away;

  try {
    const res = await fetch(
      `https://api.the-odds-api.com/v4/sports/baseball_mlb/odds/` +
      `?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h&oddsFormat=american`,
      { next: { revalidate: 300 } }
    );

    if (!res.ok) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    const games = await res.json();

    // Match by home + away team names
    const game = games.find((g: { home_team: string; away_team: string }) =>
      g.home_team === homeFull && g.away_team === awayFull
    );

    if (!game) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    // Prefer FanDuel, then DraftKings, then any available bookmaker
    const preferredBooks = ["fanduel", "draftkings", "betmgm", "williamhill_us"];
    const bookmaker =
      preferredBooks.map(k => game.bookmakers.find((b: { key: string }) => b.key === k)).find(Boolean) ??
      game.bookmakers[0];

    if (!bookmaker) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    const h2h = bookmaker.markets.find((m: { key: string }) => m.key === "h2h");
    if (!h2h) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    const homeOutcome = h2h.outcomes.find((o: { name: string }) => o.name === homeFull);
    const awayOutcome = h2h.outcomes.find((o: { name: string }) => o.name === awayFull);

    if (!homeOutcome || !awayOutcome) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    // Remove the bookmaker's vig so probabilities sum to 100%
    const rawHome = toImplied(homeOutcome.price);
    const rawAway = toImplied(awayOutcome.price);
    const total = rawHome + rawAway;
    const homeProb = Math.round((rawHome / total) * 100);

    const result: OddsResult = {
      homeProb,
      awayProb: 100 - homeProb,
      homeOdds: homeOutcome.price,
      awayOdds: awayOutcome.price,
      bookmaker: bookmaker.title,
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
