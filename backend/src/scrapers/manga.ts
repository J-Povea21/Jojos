import type { CheerioAPI } from "cheerio";
import type { Element as DomElement } from "domhandler";
import { loadCheerio, WIKI_BASE, absolutizeUrl } from "./client";
import { wikiPathToSlug, cleanTitle } from "../lib/slug";

const MANGA_HUB = `${WIKI_BASE}/JoJo%27s_Bizarre_Adventure`;
const DEFAULT_AUTHOR = "Hirohiko Araki";

export type MangaPart = {
  id: string;
  title: string;
  partNumber: number | null;
  image: string | null;
  originalRun: string | null;
  chapters: number | null;
  volumes: number | null;
  author: string;
  status: "completed" | "ongoing";
  shortDescription: string | null;
  wikiPath: string;
};

export type MangaPartDetail = MangaPart & { description: string };

function inferStatus(originalRun: string | null): MangaPart["status"] {
  if (!originalRun) return "completed";
  if (/Present/i.test(originalRun)) return "ongoing";
  return "completed";
}

function parseInteger(text: string | undefined | null): number | null {
  if (!text) return null;
  const m = text.replace(/,/g, "").match(/\d+/);
  if (!m) return null;
  const n = Number(m[0]);
  return Number.isFinite(n) ? n : null;
}

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
  return (
    absolutizeUrl(img.attr("data-src")) ?? absolutizeUrl(img.attr("src"))
  );
}

function pickBlockImage(
  block: ReturnType<CheerioAPI>,
): string | null {
  const active = block.find(".volumeTableImage .jw-tabs-content--active img").first();
  if (active.length) return imgSrc(active);
  const any = block.find(".volumeTableImage img").first();
  if (any.length) return imgSrc(any);
  const fallback = block.find("img").first();
  if (fallback.length) return imgSrc(fallback);
  return null;
}

function parseMangaBlock(
  $: CheerioAPI,
  el: DomElement,
  author: string,
): MangaPart | null {
  const block = $(el);

  const numAnchor = block.find(".volumeTableNumber a").first();
  const wikiPath = numAnchor.attr("href") ?? "";
  if (!wikiPath) return null;

  const partNumber = parseInteger(numAnchor.text());

  const titleRaw =
    block.find(".volumeTableTitle .mw-headline").first().text().trim() ||
    block.find(".volumeTableTitle h3").first().text().trim() ||
    numAnchor.attr("title") || "";
  const title = cleanTitle(titleRaw || "(unknown)");

  const image = pickBlockImage(block);

  const specs = readSpecs($, block.find(".volumeTableBDRow").first());
  const originalRun = specs["Original Run"] ?? null;
  const chapters = parseInteger(specs["Chapters"]);
  const volumes = parseInteger(specs["Volumes"]);

  const shortDescription =
    block.find(".volumeTableSpecifications p").first().text().trim() || null;

  const id = wikiPathToSlug(wikiPath);
  if (!id) return null;

  return {
    id,
    title,
    partNumber,
    image,
    originalRun,
    chapters,
    volumes,
    author,
    status: inferStatus(originalRun),
    shortDescription,
    wikiPath,
  };
}

export async function scrapeMangaList(): Promise<MangaPart[]> {
  const $ = await loadCheerio(MANGA_HUB);
  const author =
    $('.pi-item[data-source="author"] .pi-data-value').first().text().trim() ||
    DEFAULT_AUTHOR;
  const blocks = $(".volumeTableBD").toArray();
  const parts: MangaPart[] = [];
  for (const el of blocks) {
    try {
      const p = parseMangaBlock($, el, author);
      if (p) parts.push(p);
    } catch (err) {
      console.warn("[manga] block parse failed", err);
    }
  }
  return parts;
}

function extractLeadDescription($: CheerioAPI): string {
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

export async function scrapeMangaDetail(
  wikiPath: string,
  base?: MangaPart,
): Promise<MangaPartDetail | null> {
  const url = `${WIKI_BASE}${wikiPath}`;
  const $ = await loadCheerio(url);
  const description =
    extractLeadDescription($) || base?.shortDescription || "";

  const fallbackImgEl = $(".infobox img, .pi-image img, .mw-parser-output img").first();
  const fallback: MangaPart = base ?? {
    id: wikiPathToSlug(wikiPath),
    title: cleanTitle($("h1#firstHeading").text().trim() || "Unknown"),
    partNumber: null,
    image: fallbackImgEl.length ? imgSrc(fallbackImgEl) : null,
    originalRun: null,
    chapters: null,
    volumes: null,
    author: DEFAULT_AUTHOR,
    status: "completed",
    shortDescription: description.split("\n\n")[0] ?? null,
    wikiPath,
  };

  return { ...fallback, description };
}
