import type { CheerioAPI } from "cheerio";
import type { Element as DomElement } from "domhandler";
import { loadCheerio, WIKI_BASE, absolutizeUrl } from "./client";
import { wikiPathToSlug } from "../lib/slug";

const STANDS_HUB = `${WIKI_BASE}/List_of_Stands`;

export type Stand = {
  id: string;
  name: string;
  user: string | null;
  part: string;
  partSlug: string;
  image: string | null;
  ability: string | null;
  wikiPath: string;
};

// Maps the cboxTitle text (e.g. "Stardust Crusaders") to a stable
// "Part N" label and a kebab-case partSlug. Anything not in this map is
// treated as a spin-off and bucketed under "spin-offs".
const PART_BY_TITLE: Record<string, { label: string; slug: string }> = {
  "Stardust Crusaders": { label: "Part 3", slug: "part-3" },
  "Diamond is Unbreakable": { label: "Part 4", slug: "part-4" },
  "Vento Aureo": { label: "Part 5", slug: "part-5" },
  "Stone Ocean": { label: "Part 6", slug: "part-6" },
  "Steel Ball Run": { label: "Part 7", slug: "part-7" },
  JoJolion: { label: "Part 8", slug: "part-8" },
  "The JOJOLands": { label: "Part 9", slug: "part-9" },
};

const SPIN_OFFS = { label: "Spin-Offs", slug: "spin-offs" };

function imgSrc(img: ReturnType<CheerioAPI>): string | null {
  return absolutizeUrl(img.attr("data-src")) ?? absolutizeUrl(img.attr("src"));
}

function pickStandImage(box: ReturnType<CheerioAPI>): string | null {
  // Prefer the manga avatar (first .charicon img). Fall back to any img.
  const first = box.find(".charicon img").first();
  if (first.length) return imgSrc(first);
  const any = box.find("img").first();
  if (any.length) return imgSrc(any);
  return null;
}

function parseCharbox(
  $: CheerioAPI,
  el: DomElement,
  part: { label: string; slug: string },
): Stand | null {
  const box = $(el);

  const nameAnchor = box.find(".charname a").first();
  const name = nameAnchor.text().trim();
  const wikiPath = nameAnchor.attr("href")?.trim() ?? "";
  if (!name || !wikiPath) return null;

  const userAnchor = box.find(".charstand a").first();
  const userText = userAnchor.text().trim();
  const user = userText.length > 0 ? userText : null;

  const image = pickStandImage(box);

  const id = wikiPathToSlug(wikiPath);
  if (!id) return null;

  return {
    id,
    name,
    user,
    part: part.label,
    partSlug: part.slug,
    image,
    ability: null,
    wikiPath,
  };
}

function partFromCboxTitle(cbox: ReturnType<CheerioAPI>): {
  label: string;
  slug: string;
} {
  // The first anchor (or italic > anchor) inside .cboxTitle holds the part
  // name, e.g. <b>Stands in <i><a>Stardust Crusaders</a></i></b>.
  const titleEl = cbox.find(".cboxTitle").first();
  const titleText = titleEl.find("a").first().text().trim() || titleEl.text().replace(/^Stands in/i, "").trim();
  return PART_BY_TITLE[titleText] ?? SPIN_OFFS;
}

export async function scrapeStandsList(): Promise<Stand[]> {
  const $ = await loadCheerio(STANDS_HUB);
  const cboxes = $(".cbox").toArray();
  const seen = new Set<string>();
  const stands: Stand[] = [];

  for (const cboxEl of cboxes) {
    const cbox = $(cboxEl);
    const part = partFromCboxTitle(cbox);
    const charboxes = cbox.find(".charbox").toArray();
    for (const el of charboxes) {
      try {
        const stand = parseCharbox($, el, part);
        if (!stand) continue;
        if (seen.has(stand.id)) continue;
        seen.add(stand.id);
        stands.push(stand);
      } catch (err) {
        console.warn("[stands] charbox parse failed", err);
      }
    }
  }

  return stands;
}
