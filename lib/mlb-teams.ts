export interface MLBTeam {
  id: number;
  name: string;
  abbreviation: string;
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

export const MLB_LEAGUES: MLBLeague[] = [
  {
    name: "American League",
    short: "AL",
    divisions: [
      {
        name: "AL East",
        teams: [
          { id: 110, name: "Baltimore Orioles",   abbreviation: "BAL" },
          { id: 111, name: "Boston Red Sox",       abbreviation: "BOS" },
          { id: 147, name: "New York Yankees",     abbreviation: "NYY" },
          { id: 139, name: "Tampa Bay Rays",       abbreviation: "TB"  },
          { id: 141, name: "Toronto Blue Jays",    abbreviation: "TOR" },
        ],
      },
      {
        name: "AL Central",
        teams: [
          { id: 145, name: "Chicago White Sox",    abbreviation: "CWS" },
          { id: 114, name: "Cleveland Guardians",  abbreviation: "CLE" },
          { id: 116, name: "Detroit Tigers",       abbreviation: "DET" },
          { id: 118, name: "Kansas City Royals",   abbreviation: "KC"  },
          { id: 142, name: "Minnesota Twins",      abbreviation: "MIN" },
        ],
      },
      {
        name: "AL West",
        teams: [
          { id: 117, name: "Houston Astros",       abbreviation: "HOU" },
          { id: 108, name: "Los Angeles Angels",   abbreviation: "LAA" },
          { id: 133, name: "Athletics",            abbreviation: "ATH" },
          { id: 136, name: "Seattle Mariners",     abbreviation: "SEA" },
          { id: 140, name: "Texas Rangers",        abbreviation: "TEX" },
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
          { id: 144, name: "Atlanta Braves",       abbreviation: "ATL" },
          { id: 146, name: "Miami Marlins",        abbreviation: "MIA" },
          { id: 121, name: "New York Mets",        abbreviation: "NYM" },
          { id: 143, name: "Philadelphia Phillies",abbreviation: "PHI" },
          { id: 120, name: "Washington Nationals", abbreviation: "WSH" },
        ],
      },
      {
        name: "NL Central",
        teams: [
          { id: 112, name: "Chicago Cubs",         abbreviation: "CHC" },
          { id: 113, name: "Cincinnati Reds",      abbreviation: "CIN" },
          { id: 158, name: "Milwaukee Brewers",    abbreviation: "MIL" },
          { id: 134, name: "Pittsburgh Pirates",   abbreviation: "PIT" },
          { id: 138, name: "St. Louis Cardinals",  abbreviation: "STL" },
        ],
      },
      {
        name: "NL West",
        teams: [
          { id: 109, name: "Arizona Diamondbacks", abbreviation: "ARI" },
          { id: 115, name: "Colorado Rockies",     abbreviation: "COL" },
          { id: 119, name: "Los Angeles Dodgers",  abbreviation: "LAD" },
          { id: 135, name: "San Diego Padres",     abbreviation: "SD"  },
          { id: 137, name: "San Francisco Giants", abbreviation: "SF"  },
        ],
      },
    ],
  },
];
