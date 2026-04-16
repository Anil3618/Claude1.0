export interface MLBTeam {
  id: number;
  name: string;
  abbreviation: string;
  espnSlug: string; // ESPN CDN logo slug
}

export interface MLBDivision {
  name: string;
  teams: MLBTeam[];
}

export interface MLBLeague {
  name: string;
  short: "AL" | "NL";
  divisions: MLBDivision[];
}

// Logo URL: https://a.espncdn.com/i/teamlogos/mlb/500/{espnSlug}.png
export const MLB_LEAGUES: MLBLeague[] = [
  {
    name: "American League",
    short: "AL",
    divisions: [
      {
        name: "AL East",
        teams: [
          { id: 110, name: "Baltimore Orioles",   abbreviation: "BAL", espnSlug: "bal" },
          { id: 111, name: "Boston Red Sox",       abbreviation: "BOS", espnSlug: "bos" },
          { id: 147, name: "New York Yankees",     abbreviation: "NYY", espnSlug: "nyy" },
          { id: 139, name: "Tampa Bay Rays",       abbreviation: "TB",  espnSlug: "tb"  },
          { id: 141, name: "Toronto Blue Jays",    abbreviation: "TOR", espnSlug: "tor" },
        ],
      },
      {
        name: "AL Central",
        teams: [
          { id: 145, name: "Chicago White Sox",    abbreviation: "CWS", espnSlug: "chw" },
          { id: 114, name: "Cleveland Guardians",  abbreviation: "CLE", espnSlug: "cle" },
          { id: 116, name: "Detroit Tigers",       abbreviation: "DET", espnSlug: "det" },
          { id: 118, name: "Kansas City Royals",   abbreviation: "KC",  espnSlug: "kc"  },
          { id: 142, name: "Minnesota Twins",      abbreviation: "MIN", espnSlug: "min" },
        ],
      },
      {
        name: "AL West",
        teams: [
          { id: 117, name: "Houston Astros",       abbreviation: "HOU", espnSlug: "hou" },
          { id: 108, name: "Los Angeles Angels",   abbreviation: "LAA", espnSlug: "laa" },
          { id: 133, name: "Athletics",            abbreviation: "ATH", espnSlug: "oak" },
          { id: 136, name: "Seattle Mariners",     abbreviation: "SEA", espnSlug: "sea" },
          { id: 140, name: "Texas Rangers",        abbreviation: "TEX", espnSlug: "tex" },
        ],
      },
    ],
  },
  {
    name: "National League",
    short: "NL",
    divisions: [
      {
        name: "NL East",
        teams: [
          { id: 144, name: "Atlanta Braves",        abbreviation: "ATL", espnSlug: "atl" },
          { id: 146, name: "Miami Marlins",         abbreviation: "MIA", espnSlug: "mia" },
          { id: 121, name: "New York Mets",         abbreviation: "NYM", espnSlug: "nym" },
          { id: 143, name: "Philadelphia Phillies", abbreviation: "PHI", espnSlug: "phi" },
          { id: 120, name: "Washington Nationals",  abbreviation: "WSH", espnSlug: "wsh" },
        ],
      },
      {
        name: "NL Central",
        teams: [
          { id: 112, name: "Chicago Cubs",          abbreviation: "CHC", espnSlug: "chc" },
          { id: 113, name: "Cincinnati Reds",       abbreviation: "CIN", espnSlug: "cin" },
          { id: 158, name: "Milwaukee Brewers",     abbreviation: "MIL", espnSlug: "mil" },
          { id: 134, name: "Pittsburgh Pirates",    abbreviation: "PIT", espnSlug: "pit" },
          { id: 138, name: "St. Louis Cardinals",   abbreviation: "STL", espnSlug: "stl" },
        ],
      },
      {
        name: "NL West",
        teams: [
          { id: 109, name: "Arizona Diamondbacks",  abbreviation: "ARI", espnSlug: "ari" },
          { id: 115, name: "Colorado Rockies",      abbreviation: "COL", espnSlug: "col" },
          { id: 119, name: "Los Angeles Dodgers",   abbreviation: "LAD", espnSlug: "lad" },
          { id: 135, name: "San Diego Padres",      abbreviation: "SD",  espnSlug: "sd"  },
          { id: 137, name: "San Francisco Giants",  abbreviation: "SF",  espnSlug: "sf"  },
        ],
      },
    ],
  },
];

export function teamLogoUrl(espnSlug: string): string {
  return `https://a.espncdn.com/i/teamlogos/mlb/500/${espnSlug}.png`;
}
