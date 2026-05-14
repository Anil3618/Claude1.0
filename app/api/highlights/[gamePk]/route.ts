import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// In-process cache — avoids redundant API calls within one server instance
const cache = new Map<string, HighlightResult | null>();

interface HighlightResult {
  videoId: string;
  title: string;
  thumbnail: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gamePk: string }> }
) {
  const { gamePk } = await params;

  // No key configured → feature disabled gracefully
  if (!YOUTUBE_API_KEY) {
    return NextResponse.json(null);
  }

  if (cache.has(gamePk)) {
    return NextResponse.json(cache.get(gamePk) ?? null, {
      headers: { "Cache-Control": "public, s-maxage=3600" },
    });
  }

  const url = new URL(request.url);
  const away = url.searchParams.get("away") ?? "";
  const home = url.searchParams.get("home") ?? "";
  const date = url.searchParams.get("date") ?? "";

  const query = `${away} ${home} ${date} MLB highlights`;

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search` +
        `?part=snippet&type=video&maxResults=1` +
        `&q=${encodeURIComponent(query)}` +
        `&key=${YOUTUBE_API_KEY}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    const data = await res.json();
    const item = data.items?.[0];

    if (!item?.id?.videoId) {
      cache.set(gamePk, null);
      return NextResponse.json(null);
    }

    const result: HighlightResult = {
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ??
        item.snippet.thumbnails?.default?.url ??
        "",
    };

    cache.set(gamePk, result);
    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
    });
  } catch {
    cache.set(gamePk, null);
    return NextResponse.json(null);
  }
}
