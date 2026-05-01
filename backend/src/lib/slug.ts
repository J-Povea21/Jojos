// Convert a jojowiki path like "/Stardust_Crusaders_(Anime)" to a stable slug
// like "stardust-crusaders-anime". The transformation is mostly lossless for
// our purposes BUT recovering the original wiki path from the slug alone
// requires a lookup table — callers (the routes) maintain a slug->wikiPath
// map populated when scraping the list pages.

export function wikiPathToSlug(wikiPath: string): string {
  let s = wikiPath;
  // Strip leading slash
  s = s.replace(/^\/+/, "");
  // Decode percent-encoding (e.g. %27 → ')
  try {
    s = decodeURIComponent(s);
  } catch {
    // ignore malformed encoding
  }
  // Lowercase
  s = s.toLowerCase();
  // Apostrophes and other punctuation drop out
  s = s.replace(/['"`’]/g, "");
  // Replace underscores, parens, colons, spaces with hyphens
  s = s.replace(/[\s_():,!?\.]+/g, "-");
  // Collapse runs of hyphens
  s = s.replace(/-+/g, "-");
  // Trim leading/trailing hyphens
  s = s.replace(/^-+|-+$/g, "");
  return s;
}

// Trivial title cleanup: strip the boilerplate prefix and quotes.
export function cleanTitle(raw: string): string {
  return raw
    .replace(/^JoJo's Bizarre Adventure:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}
