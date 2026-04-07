#!/usr/bin/env python3
"""
sync_schedule.py
Fetches today's (and next 7 days') MLB schedule from the free MLB Stats API,
merges in platform-exclusive overrides from data/platform_exclusives.json,
and writes the result to web/public/data/schedule.json.

Run manually:  python scripts/sync_schedule.py
Run via cron:  GitHub Actions calls this every 6 hours.
"""

import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
ROOT = Path(__file__).resolve().parent.parent
EXCLUSIVES_FILE = ROOT / "data" / "platform_exclusives.json"
OUTPUT_FILE = ROOT / "public" / "data" / "schedule.json"

# ---------------------------------------------------------------------------
# MLB Stats API — free, public, no auth required
# ---------------------------------------------------------------------------
MLB_API = "https://statsapi.mlb.com/api/v1/schedule"

# Keys are the UPPERCASE broadcast names as returned by the MLB Stats API.
# "NBC/PEACOCK" is the combined entry the API uses for NBC+Peacock simulcasts.
# "APPLE TV" is how the API spells Apple TV+ (no plus sign).
PLATFORM_DISPLAY = {
    # National streaming exclusives
    "APPLE TV":          {"label": "Apple TV+",   "color": "#555555", "url": "https://tv.apple.com/"},
    "APPLE TV+":         {"label": "Apple TV+",   "color": "#555555", "url": "https://tv.apple.com/"},
    "NETFLIX":           {"label": "Netflix",     "color": "#E50914", "url": "https://www.netflix.com/"},
    "PEACOCK":           {"label": "Peacock",     "color": "#000000", "url": "https://www.peacocktv.com/"},
    "AMAZON PRIME VIDEO":{"label": "Prime Video", "color": "#00A8E0", "url": "https://www.amazon.com/primevideo"},

    # Broadcast / cable
    "FOX":               {"label": "Fox",         "color": "#003087", "url": "https://www.fox.com/live/"},
    "FS1":               {"label": "FS1",         "color": "#003087", "url": "https://www.foxsports.com/live"},
    "TBS":               {"label": "TBS",         "color": "#0099CC", "url": "https://www.tbs.com/watchtbs"},
    "MAX":               {"label": "Max",         "color": "#002BE7", "url": "https://www.max.com/"},
    "NBC":               {"label": "NBC",         "color": "#0B2265", "url": "https://www.nbc.com/"},
    "NBC/PEACOCK":       {"label": "NBC / Peacock","color": "#000000", "url": "https://www.peacocktv.com/"},
    "ESPN":              {"label": "ESPN",        "color": "#CC0000", "url": "https://www.espn.com/watch/"},
    "ESPN+":             {"label": "ESPN+",       "color": "#CC0000", "url": "https://plus.espn.com/"},
    "ESPN2":             {"label": "ESPN2",       "color": "#CC0000", "url": "https://www.espn.com/watch/"},
    "MLB NETWORK":       {"label": "MLB Network", "color": "#002D72", "url": "https://www.mlb.com/network"},
    "MLB.TV":            {"label": "MLB.TV",      "color": "#002D72", "url": "https://www.mlb.com/tv"},

    # Regional Sports Networks (RSNs) — verified from MLB API broadcast data
    "SPORTSNET LA":      {"label": "Spectrum SportsNet LA", "color": "#005BA1", "url": "https://www.spectrumnews1.com/ca/la-sports"},
    "YES":               {"label": "YES Network", "color": "#003087", "url": "https://www.yesnetwork.com/"},
    "NESN":              {"label": "NESN",        "color": "#003087", "url": "https://www.nesn.com/"},
    "MASN":              {"label": "MASN",        "color": "#E03A3E", "url": "https://www.masnsports.com/"},
    "SNY":               {"label": "SNY",         "color": "#002D72", "url": "https://sny.tv/"},
    "SPACE CITY HOME NETWORK": {"label": "Space City Home Network", "color": "#002D62", "url": "https://www.spacecityhomenetwork.com/"},
    "MARQUEE SPORTS NETWORK":  {"label": "Marquee Sports",  "color": "#CC3433", "url": "https://www.marqueesportsnetwork.com/"},
    "CHICAGO SPORTS NETWORK":  {"label": "Chicago Sports Network", "color": "#27251F", "url": "https://www.chicagosportsnetwork.com/"},
    "FANDUEL SPORTS NETWORK WEST": {"label": "FanDuel Sports Network", "color": "#1493FF", "url": "https://www.nbc.com/fanduel-sports-network"},
    "NBCSP":             {"label": "NBC Sports Philadelphia", "color": "#0B2265", "url": "https://www.nbcsports.com/philadelphia"},
    "NBCS BA":           {"label": "NBC Sports Bay Area",     "color": "#0B2265", "url": "https://www.nbcsports.com/bayarea"},
    "NBCSCA":            {"label": "NBC Sports California",   "color": "#0B2265", "url": "https://www.nbcsports.com/california"},

    # Team-owned streaming services (direct subscription, no RSN deal required)
    "BRAVESVISION":      {"label": "BravesVision",  "color": "#CE1141", "url": "https://www.mlb.com/braves/ballpark/bravesvision"},
    "BREWERS.TV":        {"label": "Brewers.TV",    "color": "#12284B", "url": "https://www.mlb.com/brewers/fans/brewers-tv"},
    "CARDINALS.TV":      {"label": "Cardinals.TV",  "color": "#C41E3A", "url": "https://www.mlb.com/cardinals/fans/cardinals-tv"},
    "DBACKS.TV":         {"label": "Dbacks.TV",     "color": "#A71930", "url": "https://www.mlb.com/dbacks/fans/dbacks-tv"},
    "GUARDIANS.TV PRESENTED BY PROGRESSIVE": {"label": "Guardians.TV", "color": "#00385D", "url": "https://www.mlb.com/guardians/fans/guardians-tv"},
    "MARINERS.TV":       {"label": "Mariners.TV",   "color": "#0C2C56", "url": "https://www.mlb.com/mariners/fans/mariners-tv"},
    "MARLINS.TV":        {"label": "Marlins.TV",    "color": "#00A3E0", "url": "https://www.mlb.com/marlins/fans/marlins-tv"},
    "NATIONALS.TV":      {"label": "Nationals.TV",  "color": "#AB0003", "url": "https://www.mlb.com/nationals/fans/nationals-tv"},
    "PADRES.TV PRESENTED BY UC SAN DIEGO HEALTH": {"label": "Padres.TV", "color": "#2F241D", "url": "https://www.mlb.com/padres/fans/padres-tv"},
    "RANGERS SPORTS NETWORK": {"label": "Rangers Sports Network", "color": "#003278", "url": "https://www.mlb.com/rangers"},
    "RAYS.TV":           {"label": "Rays.TV",       "color": "#092C5C", "url": "https://www.mlb.com/rays/fans/rays-tv"},
    "REDS.TV":           {"label": "Reds.TV",       "color": "#C6011F", "url": "https://www.mlb.com/reds/fans/reds-tv"},
    "ROCKIES.TV":        {"label": "Rockies.TV",    "color": "#333366", "url": "https://www.mlb.com/rockies/fans/rockies-tv"},
    "ROYALS.TV":         {"label": "Royals.TV",     "color": "#174885", "url": "https://www.mlb.com/royals/fans/royals-tv"},
    "TWINS.TV PRESENTED BY PROGRESSIVE": {"label": "Twins.TV", "color": "#002B5C", "url": "https://www.mlb.com/twins/fans/twins-tv"},
    "DETROIT SPORTSNET": {"label": "Detroit SportsNet", "color": "#0C2340", "url": "https://www.mlb.com/tigers"},
}


def fetch_schedule(start: date, end: date) -> list[dict]:
    """Call MLB Stats API and return raw game list for the date range."""
    params = {
        "sportId": 1,           # MLB
        "startDate": start.strftime("%Y-%m-%d"),
        "endDate": end.strftime("%Y-%m-%d"),
        "hydrate": "broadcasts(all),team,venue,game(content(editorial(recap)))",
    }
    resp = requests.get(MLB_API, params=params, timeout=15)
    resp.raise_for_status()
    data = resp.json()

    games = []
    for date_entry in data.get("dates", []):
        for game in date_entry.get("games", []):
            games.append(game)
    return games


def load_exclusives() -> dict:
    """Load platform_exclusives.json — keyed by game_date (YYYY-MM-DD) or game_pk."""
    if not EXCLUSIVES_FILE.exists():
        return {}
    with open(EXCLUSIVES_FILE) as f:
        return json.load(f)


def normalize_broadcast_name(raw: str) -> str:
    """Uppercase and strip to match PLATFORM_DISPLAY keys."""
    return raw.upper().strip()


def build_platforms(game: dict, exclusives: dict) -> list[dict]:
    """
    Return a list of platform dicts for a game.
    Sources:
      1. MLB API broadcasts field
      2. platform_exclusives.json overrides (by game_pk or by date+team)
    """
    platforms = {}

    # --- From MLB API broadcasts ---
    for bc in game.get("broadcasts", []):
        name_raw = bc.get("name", "")
        name = normalize_broadcast_name(name_raw)
        if name and name in PLATFORM_DISPLAY:
            platforms[name] = PLATFORM_DISPLAY[name].copy()

    # --- From static exclusives override ---
    game_pk = str(game.get("gamePk", ""))
    game_date = game.get("gameDate", "")[:10]  # YYYY-MM-DD

    # Check by gamePk
    if game_pk in exclusives.get("by_game_pk", {}):
        for plat in exclusives["by_game_pk"][game_pk]:
            name = normalize_broadcast_name(plat)
            if name in PLATFORM_DISPLAY:
                platforms[name] = PLATFORM_DISPLAY[name].copy()

    # Check by date (e.g., all Friday games → Apple TV+)
    for rule in exclusives.get("by_date_rules", []):
        if rule.get("date") == game_date:
            for plat in rule.get("platforms", []):
                name = normalize_broadcast_name(plat)
                if name in PLATFORM_DISPLAY:
                    platforms[name] = PLATFORM_DISPLAY[name].copy()

    # Check by weekday rule (e.g., every Friday → Apple TV+)
    try:
        weekday = date.fromisoformat(game_date).strftime("%A").upper()
    except ValueError:
        weekday = ""

    for rule in exclusives.get("by_weekday_rules", []):
        if rule.get("weekday", "").upper() == weekday:
            for plat in rule.get("platforms", []):
                name = normalize_broadcast_name(plat)
                if name in PLATFORM_DISPLAY:
                    platforms[name] = PLATFORM_DISPLAY[name].copy()

    return list(platforms.values())


def build_game_entry(game: dict, exclusives: dict) -> dict:
    """Convert a raw MLB API game object into our normalized schema."""
    home = game.get("teams", {}).get("home", {}).get("team", {})
    away = game.get("teams", {}).get("away", {}).get("team", {})
    venue = game.get("venue", {})
    status = game.get("status", {})

    return {
        "game_pk": game.get("gamePk"),
        "game_date": game.get("gameDate", "")[:10],
        "game_time_utc": game.get("gameDate", ""),
        "status": status.get("detailedState", "Scheduled"),
        "home_team": {
            "id": home.get("id"),
            "name": home.get("name"),
            "abbreviation": home.get("abbreviation"),
        },
        "away_team": {
            "id": away.get("id"),
            "name": away.get("name"),
            "abbreviation": away.get("abbreviation"),
        },
        "venue": venue.get("name"),
        "platforms": build_platforms(game, exclusives),
    }


def main():
    today = date.today()
    end = today + timedelta(days=6)  # today + 6 more days = 7-day window

    print(f"Fetching MLB schedule {today} → {end} ...")
    raw_games = fetch_schedule(today, end)
    print(f"  {len(raw_games)} games found from MLB API")

    exclusives = load_exclusives()
    print(f"  Loaded platform_exclusives.json ({len(exclusives)} top-level keys)")

    normalized = [build_game_entry(g, exclusives) for g in raw_games]

    # Group by date for easy frontend consumption
    by_date: dict[str, list] = {}
    for g in normalized:
        d = g["game_date"]
        by_date.setdefault(d, []).append(g)

    output = {
        "generated_at": date.today().isoformat(),
        "game_count": len(normalized),
        "dates": by_date,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(output, f, indent=2)

    print(f"  Written → {OUTPUT_FILE}")
    print(f"Done. {len(normalized)} games across {len(by_date)} dates.")


if __name__ == "__main__":
    main()
