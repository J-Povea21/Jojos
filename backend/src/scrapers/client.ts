import * as cheerio from "cheerio";
import { getCached } from "../lib/cache";

export const WIKI_BASE = "https://jojowiki.com";
const USER_AGENT =
  "Jojos-College-Project/0.1 (educational; contact via github)";
const TTL_MS = 60 * 60 * 1000; // 1 hour

export class ScrapeError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
    this.name = "ScrapeError";
  }
}

export async function fetchHtml(url: string): Promise<string> {
  return getCached(url, TTL_MS, async () => {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (!res.ok) {
      throw new ScrapeError(
        `Upstream ${res.status} fetching ${url}`,
        res.status === 404 ? 404 : 502,
      );
    }
    return res.text();
  });
}

export async function loadCheerio(url: string) {
  const html = await fetchHtml(url);
  return cheerio.load(html);
}

// Normalize image src: jojowiki uses absolute https URLs already, but be safe.
// Handles:
//   - empty/undefined → null
//   - protocol-relative `//host/x` → `https://host/x`
//   - absolute paths `/foo` → `https://jojowiki.com/foo`
//   - already-absolute `http(s)://...` → returned as-is
//   - anything else (relative `foo.png`, `data:`, `?query`, `#frag`) → as-is
export function absolutizeUrl(src: string | undefined | null): string | null {
  if (!src) return null;
  const trimmed = src.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${WIKI_BASE}${trimmed}`;
  return trimmed;
}
