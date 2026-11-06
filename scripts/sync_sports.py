#!/usr/bin/env python3
"""
sync_sports.py
Fetches NBA, WNBA, NHL, and MLS Soccer schedules from ESPN's public API.
Outputs public/data/{sport}.json with the same schema as schedule.json.
Run via GitHub Actions alongside sync_schedule.py.
"""

import json
import requests
from datetime import date, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "public" / "data"

SPORTS = {
    "nba":    {"sport": "basketball", "league": "nba",      "label": "NBA"},
    "wnba":   {"sport": "basketball", "league": "wnba",     "label": "WNBA"},
    "nhl":    {"sport": "hockey",     "league": "nhl",      "label": "NHL"},
    "nfl":    {"sport": "football",   "league": "nfl",      "label": "NFL"},
    "soccer": {"sport": "soccer",     "league": "usa.1",    "label": "MLS"},
}

PLATFORM_MAP = {
    "ESPN":               {"label": "ESPN",          "color": "#CC0000", "url": "https://www.espn.com/watch/"},
    "ESPN2":              {"label": "ESPN2",         "color": "#CC0000", "url": "https://www.espn.com/watch/"},
    "ESPNU":              {"label": "ESPNU",         "color": "#CC0000", "url": "https://www.espn.com/watch/"},
    "ESPN+":              {"label": "ESPN+",         "color": "#CC0000", "url": "https://plus.espn.com/"},
    "ABC":                {"label": "ABC",           "color": "#006DB7", "url": "https://abc.com/"},
    "TNT":                {"label": "TNT",           "color": "#FF8200", "url": "https://www.tntdrama.com/watchtnt"},
    "TBS":                {"label": "TBS",           "color": "#0099CC", "url": "https://www.tbs.com/"},
    "truTV":              {"label": "truTV",         "color": "#00B4E0", "url": "https://www.trutv.com/"},
    "NBA TV":             {"label": "NBA TV",        "color": "#1D428A", "url": "https://www.nba.com/watch"},
    "NHL Network":        {"label": "NHL Network",   "color": "#00205B", "url": "https://www.nhl.com/tv"},
    "CBS":                {"label": "CBS",           "color": "#0033A0", "url": "https://www.cbs.com/"},
    "FOX":                {"label": "Fox",           "color": "#003087", "url": "https://www.fox.com/"},
    "FS1":                {"label": "FS1",           "color": "#003087", "url": "https://www.foxsports.com/"},
    "NBC":                {"label": "NBC",           "color": "#0B2265", "url": "https://www.nbc.com/"},
    "USA":                {"label": "USA Network",   "color": "#0A5DAB", "url": "https://www.usanetwork.com/"},
    "Peacock":            {"label": "Peacock",       "color": "#000000", "url": "https://www.peacocktv.com/"},
    "Apple TV+":          {"label": "Apple TV+",     "color": "#555555", "url": "https://tv.apple.com/"},
    "Apple TV":           {"label": "Apple TV+",     "color": "#555555", "url": "https://tv.apple.com/"},
    "Amazon Prime Video": {"label": "Prime Video",   "color": "#00A8E0", "url": "https://www.amazon.com/primevideo"},
    "Prime Video":        {"label": "Prime Video",   "color": "#00A8E0", "url": "https://www.amazon.com/primevideo"},
    "Max":                {"label": "Max",           "color": "#002BE7", "url": "https://www.max.com/"},
    "ION":                {"label": "ION",           "color": "#0066CC", "url": "https://iontelevision.com/"},
    "CBS Sports Network": {"label": "CBS Sports",    "color": "#0033A0", "url": "https://www.cbssports.com/"},
    "WNBA League Pass":   {"label": "WNBA League Pass", "color": "#FF6900", "url": "https://www.wnba.com/watch"},
    "MLS Season Pass":    {"label": "MLS Season Pass", "color": "#00B140", "url": "https://www.mlssoccer.com/"},
    "Turner Sports":      {"label": "TNT",           "color": "#FF8200", "url": "https://www.tntdrama.com/watchtnt"},
}


def fetch_espn(sport: str, league: str, date_str: str) -> list:
    url = f"https://site.api.espn.com/apis/site/v2/sports/{sport}/{league}/scoreboard"
    try:
        resp = requests.get(url, params={"dates": date_str.replace("-", ""), "limit": 100}, timeout=15)
        resp.raise_for_status()
        return resp.json().get("events", [])
    except Exception as e:
        print(f"  Warning: {sport}/{league} {date_str}: {e}")
        return []


def parse_event(event: dict, sport_key: str) -> dict | None:
    comp = event.get("competitions", [{}])[0]
    competitors = comp.get("competitors", [])
    home = next((c for c in competitors if c.get("homeAway") == "home"), None)
    away = next((c for c in competitors if c.get("homeAway") == "away"), None)
    if not home or not away:
        return None

    status_type = event.get("status", {}).get("type", {})
    status_name = status_type.get("description", "Scheduled")
    is_done = status_type.get("completed", False)
    is_live = status_type.get("name", "") == "STATUS_IN_PROGRESS"

    home_score = int(home.get("score") or 0) if (is_done or is_live) else None
    away_score = int(away.get("score") or 0) if (is_done or is_live) else None

    platforms, seen = [], set()
    for bc in comp.get("broadcasts", []):
        for name in bc.get("names", []):
            name = name.strip()
            mapped = PLATFORM_MAP.get(name)
            if mapped and name not in seen:
                platforms.append(mapped.copy())
                seen.add(name)

    venue = comp.get("venue", {}).get("fullName") or None

    return {
        "game_pk":     int(event.get("id", 0)),
        "game_date":   event.get("date", "")[:10],
        "game_time_utc": event.get("date", ""),
        "status":      status_name,
        "home_team": {
            "id":           int(home["team"].get("id", 0)),
            "name":         home["team"].get("displayName") or home["team"].get("name", ""),
            "abbreviation": home["team"].get("abbreviation", ""),
        },
        "away_team": {
            "id":           int(away["team"].get("id", 0)),
            "name":         away["team"].get("displayName") or away["team"].get("name", ""),
            "abbreviation": away["team"].get("abbreviation", ""),
        },
        "venue":       venue,
        "platforms":   platforms,
        "home_score":  home_score,
        "away_score":  away_score,
        "sport":       sport_key,
    }


def main():
    today = date.today()
    dates = [today - timedelta(days=1)] + [today + timedelta(days=i) for i in range(7)]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for sport_key, cfg in SPORTS.items():
        print(f"\nFetching {cfg['label']}...")
        by_date: dict[str, list] = {}
        total = 0

        for d in dates:
            events = fetch_espn(cfg["sport"], cfg["league"], d.isoformat())
            games = [g for ev in events if (g := parse_event(ev, sport_key))]
            if games:
                by_date[d.isoformat()] = games
                total += len(games)
                print(f"  {d}: {len(games)} games")

        output = {
            "generated_at": today.isoformat(),
            "sport":        sport_key,
            "label":        cfg["label"],
            "game_count":   total,
            "dates":        by_date,
        }

        out_file = OUTPUT_DIR / f"{sport_key}.json"
        with open(out_file, "w") as f:
            json.dump(output, f, indent=2)
        print(f"  → {out_file} ({total} games)")


if __name__ == "__main__":
    main()
