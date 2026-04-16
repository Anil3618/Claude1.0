// Platforms with internal /platform/[slug] pages (have game data from MLB API)
const STREAMING = [
  { slug: "apple-tv-plus", label: "Apple TV+",   color: "#1C1C1E", border: "#48484A" },
  { slug: "netflix",        label: "Netflix",     color: "#E50914", border: "#E50914" },
  { slug: "peacock",        label: "Peacock",     color: "#4B0082", border: "#9B59B6" },
  { slug: "max",            label: "Max",         color: "#002BE7", border: "#3355FF" },
  { slug: "prime-video",    label: "Prime Video", color: "#00A8E0", border: "#00A8E0" },
  { slug: "espn",           label: "ESPN",        color: "#CC0000", border: "#FF2222" },
  { slug: "espn-plus",      label: "ESPN+",       color: "#000F6B", border: "#002CB9" },
  { slug: "espn2",          label: "ESPN2",       color: "#8B0000", border: "#CC0000" },
  { slug: "fox",            label: "Fox",         color: "#003087", border: "#1565C0" },
  { slug: "fs1",            label: "FS1",         color: "#002060", border: "#003087" },
  { slug: "tbs",            label: "TBS",         color: "#007AA5", border: "#0099CC" },
  { slug: "nbc",            label: "NBC",         color: "#0B2265", border: "#1A3A8A" },
  { slug: "mlb-network",    label: "MLB Network", color: "#002D72", border: "#004FC4" },
  { slug: "mlb-tv",         label: "MLB.TV",      color: "#041E42", border: "#0057D8" },
];

// vMVPDs — link directly to their sites (they carry the networks above)
const VMVPDS = [
  { href: "https://tv.youtube.com",          label: "YouTube TV",     color: "#282828", border: "#FF0000" },
  { href: "https://www.sling.com",           label: "Sling TV",       color: "#1B3A6B", border: "#2563EB" },
  { href: "https://www.directv.com/stream",  label: "DirecTV Stream", color: "#00A0DC", border: "#00A0DC" },
  { href: "https://www.fubo.tv",             label: "Fubo",           color: "#E8000B", border: "#E8000B" },
  { href: "https://www.hulu.com/live-tv",    label: "Hulu Live",      color: "#1CE783", border: "#1CE783" },
];

export function PlatformStrip() {
  return (
    <div className="border-b border-gray-800/60 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex gap-2 overflow-x-auto py-2.5 no-scrollbar items-center">

          {/* Streaming / broadcast platforms */}
          {STREAMING.map(p => (
            <a
              key={p.slug}
              href={`/platform/${p.slug}`}
              className="flex-none px-3 py-1.5 rounded-lg text-xs font-semibold text-white/90 hover:text-white hover:brightness-125 transition-all whitespace-nowrap border"
              style={{ backgroundColor: p.color + "dd", borderColor: p.border + "77" }}
            >
              {p.label}
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
