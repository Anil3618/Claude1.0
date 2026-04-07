import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Baseball on TV Tonight | Where to Watch MLB Games",
  description:
    "Find every MLB game on TV or streaming tonight. See which games are on Apple TV+, Netflix, Peacock, ESPN, Fox, Max, and more — in one place.",
  openGraph: {
    title: "Baseball on TV Tonight",
    description: "Find every MLB game on TV or streaming tonight.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen font-sans antialiased">
        <header className="border-b border-gray-800 px-4 py-3">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚾</span>
              <span className="font-bold text-lg tracking-tight">
                Baseball on TV
              </span>
            </a>
            <nav className="flex gap-4 text-sm text-gray-400">
              <a href="/" className="hover:text-white transition-colors">
                Tonight
              </a>
              <a
                href="/platform/apple-tv-plus"
                className="hover:text-white transition-colors"
              >
                Apple TV+
              </a>
              <a
                href="/platform/peacock"
                className="hover:text-white transition-colors"
              >
                Peacock
              </a>
              <a
                href="/platform/espn-plus"
                className="hover:text-white transition-colors"
              >
                ESPN+
              </a>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-800 mt-16 px-4 py-6 text-center text-xs text-gray-600">
          Schedule data via MLB Stats API · Updated every 6 hours ·{" "}
          <a
            href="mailto:hello@baseballontv.com"
            className="hover:text-gray-400"
          >
            Contact
          </a>
        </footer>
      </body>
    </html>
  );
}
