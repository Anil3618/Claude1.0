export interface Platform {
  label: string;
  color: string;
  url: string;
}

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
}

export interface Game {
  game_pk: number;
  game_date: string;       // YYYY-MM-DD
  game_time_utc: string;   // ISO 8601
  status: string;
  home_team: Team;
  away_team: Team;
  venue: string;
  platforms: Platform[];
}

export interface ScheduleData {
  generated_at: string;    // YYYY-MM-DD
  game_count: number;
  dates: Record<string, Game[]>;   // keyed by YYYY-MM-DD
}
