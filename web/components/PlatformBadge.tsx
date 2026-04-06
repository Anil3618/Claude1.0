import type { Platform } from "@/lib/types";

// Affiliate/deep-link URLs per platform
// Replace with actual affiliate tagged URLs when enrolled in each program
const AFFILIATE_URLS: Record<string, string> = {
  "Apple TV+":   "https://apple.co/3BaseballTV",   // Apple affiliate tag
  "Peacock":     "https://pck.tv/baseball-tv",      // Peacock affiliate tag
  "ESPN+":       "https://espnplus.com/?ref=baseballontv",
  "Netflix":     "https://netflix.com/",             // Netflix has no affiliate program
  "Max":         "https://www.max.com/?ref=baseballontv",
  "YouTube TV":  "https://tv.youtube.com/welcome/?utm_source=baseballontv",
  "fuboTV":      "https://www.fubo.tv/welcome?irad=baseballontv",
  "DirecTV Stream": "https://www.directv.com/stream/?ref=baseballontv",
  "Sling TV":    "https://www.sling.com/?ref=baseballontv",
};

interface Props {
  platform: Platform;
}

export function PlatformBadge({ platform }: Props) {
  const href = AFFILIATE_URLS[platform.label] ?? platform.url;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-white hover:opacity-80 transition-opacity"
      style={{ backgroundColor: platform.color }}
      aria-label={`Watch on ${platform.label}`}
    >
      {platform.label}
      <svg
        className="w-3 h-3 opacity-70"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
