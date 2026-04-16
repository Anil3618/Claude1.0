const PLATFORMS = [
  { slug: "apple-tv-plus", label: "Apple TV+",  color: "#1C1C1E", border: "#48484A" },
  { slug: "netflix",        label: "Netflix",    color: "#E50914", border: "#E50914" },
  { slug: "peacock",        label: "Peacock",    color: "#1A1A2E", border: "#9B59B6" },
  { slug: "espn",           label: "ESPN",       color: "#CC0000", border: "#CC0000" },
  { slug: "espn-plus",      label: "ESPN+",      color: "#000F6B", border: "#002CB9" },
  { slug: "fox",            label: "Fox",        color: "#003087", border: "#003087" },
  { slug: "fs1",            label: "FS1",        color: "#003087", border: "#1565C0" },
  { slug: "tbs",            label: "TBS",        color: "#0099CC", border: "#0099CC" },
  { slug: "max",            label: "Max",        color: "#002BE7", border: "#002BE7" },
  { slug: "mlb-network",    label: "MLB Network",color: "#002D72", border: "#004FC4" },
  { slug: "mlb-tv",         label: "MLB.TV",     color: "#002D72", border: "#0057D8" },
  { slug: "nbc",            label: "NBC",        color: "#0B2265", border: "#1A3A8A" },
];

export function PlatformStrip() {
  return (
    <div className="border-b border-gray-800/60 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide no-scrollbar">
          {PLATFORMS.map(p => (
            <a
              key={p.slug}
              href={`/platform/${p.slug}`}
              className="flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white/90 hover:text-white hover:brightness-110 transition-all whitespace-nowrap border"
              style={{ backgroundColor: p.color + "cc", borderColor: p.border + "66" }}
            >
              {p.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
