import type { CheerioAPI } from "cheerio";
import type { Element as DomElement } from "domhandler";
import { loadCheerio, WIKI_BASE, absolutizeUrl } from "./client";
import { wikiPathToSlug, cleanTitle } from "../lib/slug";

const ANIME_HUB = `${WIKI_BASE}/JoJo%27s_Bizarre_Adventure:_The_Animation`;

export type AnimePart = {
  id: string;
  title: string;
  seasonNumber: number | null;
  image: string | null;
  originalRun: string | null;
  episodes: number | null;
  volumes: number | null;
  status: "completed" | "ongoing" | "upcoming";
  shortDescription: string | null;
  wikiPath: string;
};

export type Character = {
  name: string;
  image: string | null;
  role: string | null;
  japaneseVA: string | null;
  wikiPath: string | null;
};

export type AnimePartDetail = AnimePart & {
  description: string;
  mainCharacters: Character[];
};

function inferStatus(originalRun: string | null): AnimePart["status"] {
  if (!originalRun) return "completed";
  if (/TBA|Upcoming/i.test(originalRun)) return "upcoming";
  if (/Present/i.test(originalRun)) return "ongoing";
  return "completed";
}

function parseInteger(text: string | undefined | null): number | null {
  if (!text) return null;
  // Strip thousands separators (commas) before matching so "1,234" → 1234.
  const m = text.replace(/,/g, "").match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

// Read a "specs" row inside a volumeTableBD: pairs of heading -> value cell.
function readSpecs(
  $: CheerioAPI,
  row: ReturnType<CheerioAPI>,
): Record<string, string> {
  const out: Record<string, string> = {};
  const cells = row.find(".volumeTableCellBD").toArray();
  for (let i = 0; i < cells.length; i++) {
    const currentEl = cells[i];
    if (!currentEl) continue;
    const cell = $(currentEl);
    if (cell.hasClass("volumeTableHeading")) {
      const label = cell.text().trim();
      if (!label) continue;
      const nextEl = cells[i + 1];
      if (!nextEl) break;
      const next = $(nextEl);
      if (!next.hasClass("volumeTableHeading")) {
        out[label] = next.text().trim().replace(/\s+/g, " ");
        i++;
      }
    }
  }
  return out;
}

function imgSrc(img: ReturnType<CheerioAPI>): string | null {
  // Cheerio v1 / lazy-loading wikis sometimes put the real URL in data-src
  // and use a 1x1 placeholder in src. Prefer data-src if present.
  return (
    absolutizeUrl(img.attr("data-src")) ?? absolutizeUrl(img.attr("src"))
  );
}

function pickBlockImage(
  block: ReturnType<CheerioAPI>,
): string | null {
  // Prefer the active poster tab; fall back to first img inside volumeTableImage,
  // then to any img inside the block.
  const active = block.find(".volumeTableImage .jw-tabs-content--active img").first();
  if (active.length) return imgSrc(active);
  const any = block.find(".volumeTableImage img").first();
  if (any.length) return imgSrc(any);
  const fallback = block.find("img").first();
  if (fallback.length) return imgSrc(fallback);
  return null;
}

function parseAnimeBlock(
  $: CheerioAPI,
  el: DomElement,
): AnimePart | null {
  const block = $(el);

  const numAnchor = block.find(".volumeTableNumber a").first();
  const wikiPath = numAnchor.attr("href") ?? "";
  if (!wikiPath) return null;

  const seasonNumber = parseInteger(numAnchor.text());

  // Title: prefer the .mw-headline span text (visible name).
  const titleRaw =
    block.find(".volumeTableTitle .mw-headline").first().text().trim() ||
    block.find(".volumeTableTitle h3").first().text().trim();
  const title = cleanTitle(titleRaw || "(unknown)");

  const image = pickBlockImage(block);

  const specsRow = block.find(".volumeTableBDRow").first();
  const specs = readSpecs($, specsRow);

  const originalRun = specs["Original Run"] ?? null;
  const episodes = parseInteger(specs["Episodes"]);
  const volumes = parseInteger(specs["Volumes"]);

  const shortDescription =
    block.find(".volumeTableSpecifications p").first().text().trim() || null;

  const id = wikiPathToSlug(wikiPath);
  if (!id) return null;

  return {
    id,
    title,
    seasonNumber,
    image,
    originalRun,
    episodes,
    volumes,
    status: inferStatus(originalRun),
    shortDescription,
    wikiPath,
  };
}

export async function scrapeAnimeList(): Promise<AnimePart[]> {
  const $ = await loadCheerio(ANIME_HUB);
  const blocks = $(".volumeTableBD").toArray();
  const parts: AnimePart[] = [];
  for (const el of blocks) {
    try {
      const p = parseAnimeBlock($, el);
      if (p) parts.push(p);
    } catch (err) {
      console.warn("[anime] block parse failed", err);
    }
  }
  return parts;
}

function extractCharacter(
  $: CheerioAPI,
  el: DomElement,
): Character | null {
  const box = $(el);
  const nameAnchor = box.find(".castChar a").first();
  const name = nameAnchor.text().trim();
  if (!name) return null;
  const wikiPath = nameAnchor.attr("href")?.trim() || null;
  const imgEl = box.find(".castboxImg img").first();
  const image = imgEl.length ? imgSrc(imgEl) : null;
  const role = box.find(".castStatus").first().text().trim() || null;
  // Japanese voice actor: first <a> inside the JP cast-va span.
  const jpEl = box.find('.cast-va[data-cast-lang="jp"] a').first();
  const japaneseVAText = jpEl.length ? jpEl.text().trim() : "";
  const japaneseVA = japaneseVAText || null;
  return { name, image, role, japaneseVA, wikiPath };
}

function extractLeadDescription($: CheerioAPI): string {
  // Lead = direct <p> children of mw-parser-output, until first <h2>.
  const root = $(".mw-parser-output").first();
  if (!root.length) return "";
  const paragraphs: string[] = [];
  root.children().each((_i, el) => {
    const tag = (el as DomElement).tagName?.toLowerCase?.();
    if (tag === "h2") return false; // stop iteration
    if (tag === "p") {
      const txt = $(el).text().trim();
      if (txt) paragraphs.push(txt);
    }
    return undefined;
  });
  return paragraphs.join("\n\n");
}

export async function scrapeAnimeDetail(
  wikiPath: string,
  base?: AnimePart,
): Promise<AnimePartDetail | null> {
  const url = `${WIKI_BASE}${wikiPath}`;
  const $ = await loadCheerio(url);

  const description = extractLeadDescription($) || base?.shortDescription || "";
  const charactersEls = $(".castbox").toArray();
  const mainCharacters: Character[] = [];
  for (const el of charactersEls.slice(0, 10)) {
    const c = extractCharacter($, el);
    if (c) mainCharacters.push(c);
  }

  // If we don't have a base record, synthesize a minimal one from the page.
  const fallbackImgEl = $(".infobox img, .pi-image img, .mw-parser-output img").first();
  const fallback: AnimePart = base ?? {
    id: wikiPathToSlug(wikiPath),
    title: cleanTitle($("h1#firstHeading").text().trim() || "Unknown"),
    seasonNumber: null,
    image: fallbackImgEl.length ? imgSrc(fallbackImgEl) : null,
    originalRun: null,
    episodes: null,
    volumes: null,
    status: "completed",
    shortDescription: description.split("\n\n")[0] ?? null,
    wikiPath,
  };

  return {
    ...fallback,
    description,
    mainCharacters,
  };
}
