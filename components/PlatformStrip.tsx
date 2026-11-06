// Sports each platform carries — shown as emoji tags on each chip
const STREAMING = [
  { slug: "espn",           label: "ESPN",           sports: "🏈🏀🏒⚾",  color: "#CC0000", border: "#FF2222" },
  { slug: "abc",            label: "ABC",            sports: "🏈🏀🏒",   color: "#006DB7", border: "#0088DD" },
  { slug: "fox",            label: "Fox",            sports: "🏈⚾",    color: "#003087", border: "#1565C0" },
  { slug: "cbs",            label: "CBS",            sports: "🏈",      color: "#0033A0", border: "#1A5FCC" },
  { slug: "nbc",            label: "NBC",            sports: "🏈🏒",    color: "#0B2265", border: "#1A3A8A" },
  { slug: "tnt",            label: "TNT",            sports: "🏀🏒",    color: "#CC5200", border: "#FF6600" },
  { slug: "tbs",            label: "TBS",            sports: "🏀",      color: "#007AA5", border: "#0099CC" },
  { slug: "trutv",          label: "truTV",          sports: "🏀🏒",    color: "#0088AA", border: "#00B4E0" },
  { slug: "prime-video",    label: "Prime Video",    sports: "🏈",      color: "#00A8E0", border: "#00A8E0" },
  { slug: "apple-tv-plus",  label: "Apple TV+",      sports: "⚾⚽",    color: "#1C1C1E", border: "#48484A" },
  { slug: "peacock",        label: "Peacock",        sports: "🏈",      color: "#4B0082", border: "#9B59B6" },
  { slug: "max",            label: "Max",            sports: "🏀🏒",    color: "#002BE7", border: "#3355FF" },
  { slug: "espn-plus",      label: "ESPN+",          sports: "🏈🏀🏒⚾", color: "#000F6B", border: "#002CB9" },
  { slug: "fs1",            label: "FS1",            sports: "🏈⚾",    color: "#002060", border: "#003087" },
  { slug: "nba-tv",         label: "NBA TV",         sports: "🏀",      color: "#1D428A", border: "#2563EB" },
  { slug: "nhl-network",    label: "NHL Network",    sports: "🏒",      color: "#00205B", border: "#0033A0" },
  { slug: "ion",            label: "ION",            sports: "🏀",      color: "#005599", border: "#0077CC" },
  { slug: "mlb-network",    label: "MLB Network",    sports: "⚾",      color: "#002D72", border: "#004FC4" },
  { slug: "mls-season-pass",label: "MLS Season Pass",sports: "⚽",      color: "#00662B", border: "#00B140" },
];

// vMVPDs — carry all the networks above
const VMVPDS = [
  { href: "https://tv.youtube.com",         label: "YouTube TV",     border: "#FF0000" },
  { href: "https://www.sling.com",          label: "Sling TV",       border: "#2563EB" },
  { href: "https://www.directv.com/stream", label: "DirecTV Stream", border: "#00A0DC" },
  { href: "https://www.fubo.tv",            label: "Fubo",           border: "#E8000B" },
  { href: "https://www.hulu.com/live-tv",   label: "Hulu Live",      border: "#1CE783" },
];

export function PlatformStrip() {
  return (
    <div className="border-b border-gray-800/60 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-2.5 no-scrollbar items-center">

          {/* Platforms — link to per-platform game listings */}
          {STREAMING.map(p => (
            <a
              key={p.slug}
              href={`/platform/${p.slug}`}
              className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/90 hover:text-white hover:brightness-125 transition-all whitespace-nowrap border"
              style={{ backgroundColor: p.color + "dd", borderColor: p.border + "77" }}
            >
              <span>{p.label}</span>
              <span className="text-[10px] opacity-70 tracking-tight">{p.sports}</span>
            </a>
          ))}

          {/* Divider */}
          <span className="flex-none w-px h-5 bg-gray-700 mx-1" />
          <span className="flex-none text-[10px] text-gray-600 uppercase tracking-widest whitespace-nowrap">
            Live TV
          </span>

          {/* vMVPDs — external links */}
          {VMVPDS.map(p => (
            <a
              key={p.href}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-none px-3 py-1.5 rounded-lg text-xs font-semibold text-white/80 hover:text-white hover:brightness-125 transition-all whitespace-nowrap border"
              style={{ backgroundColor: "#111827", borderColor: p.border + "55" }}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
