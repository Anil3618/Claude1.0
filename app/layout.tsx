import type { Metadata } from "next";
import "./globals.css";
import { PlatformStrip } from "@/components/PlatformStrip";

export const metadata: Metadata = {
  title: "Sports on TV Tonight | Where to Watch MLB, NBA, NFL, NHL",
  description:
    "Every game on TV or streaming tonight — MLB, NBA, NFL, NHL, MLS and more. See which games are on ESPN, Apple TV+, Netflix, Peacock, Fox and more.",
  openGraph: {
    title: "Sports on TV Tonight",
    description: "Every game. Every platform. One place.",
    type: "website",
  },
};

const SPORTS_NAV = [
  { href: "/",       label: "MLB",  emoji: "⚾" },
  { href: "/nfl",    label: "NFL",  emoji: "🏈" },
  { href: "/nba",    label: "NBA",  emoji: "🏀" },
  { href: "/nhl",    label: "NHL",  emoji: "🏒" },
  { href: "/wnba",   label: "WNBA", emoji: "🏀" },
  { href: "/soccer", label: "MLS",  emoji: "⚽" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen font-sans antialiased">
        {/* Header */}
        <header className="border-b border-gray-800 bg-gray-950/90 backdrop-blur sticky top-0 z-40">
          <div className="h-0.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-800" />
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">📺</span>
              <span className="font-bold text-lg tracking-tight group-hover:text-blue-400 transition-colors">
                Sports on TV
              </span>
            </a>
            <nav className="flex gap-1 text-sm">
              {SPORTS_NAV.map(s => (
                <a
                  key={s.href}
                  href={s.href}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors font-medium"
                >
                  <span className="hidden sm:inline text-base leading-none">{s.emoji}</span>
                  <span>{s.label}</span>
                </a>
              ))}
            </nav>
          </div>
        </header>
        <PlatformStrip />

        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

        <footer className="border-t border-gray-800 mt-16 px-4 py-6">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
            <span>
              MLB data via <span className="text-gray-500">MLB Stats API</span> ·
              Other sports via <span className="text-gray-500">ESPN</span> · Updated every 6 hours
            </span>
            <a href="mailto:hello@gamesballs.org" className="hover:text-gray-400 transition-colors">
              Contact
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}

