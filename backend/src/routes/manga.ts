import { Elysia, t } from "elysia";
import { scrapeMangaList, scrapeMangaDetail } from "../scrapers/manga";
import { MangaPartModel, MangaPartDetailModel } from "../models/manga";
import { ErrorModel } from "../models/common";
import { ScrapeError } from "../scrapers/client";

function scrapeErrorResponse(err: unknown, set: { status?: number | string }) {
  const status = err instanceof ScrapeError ? err.status : 502;
  set.status = status;
  return {
    error: {
      code: status === 404 ? "NOT_FOUND" : "SCRAPE_FAILED",
      message: err instanceof Error ? err.message : "Unknown error",
    },
  };
}

export const mangaRoutes = new Elysia({ prefix: "/manga", tags: ["manga"] })
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const list = await scrapeMangaList();
        const q = query.q?.toLowerCase().trim();
        if (!q) return list;
        return list.filter((p) => p.title.toLowerCase().includes(q));
      } catch (err) {
        return scrapeErrorResponse(err, set);
      }
    },
    {
      query: t.Object({ q: t.Optional(t.String()) }),
      response: {
        200: t.Array(MangaPartModel),
        404: ErrorModel,
        502: ErrorModel,
      },
      detail: { summary: "List JoJo manga parts" },
    },
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      const id = params.id?.trim();
      if (!id) {
        set.status = 400;
        return {
          error: { code: "BAD_REQUEST", message: "Missing id parameter" },
        };
      }
      try {
        const list = await scrapeMangaList();
        const base = list.find((p) => p.id === id);
        if (!base) {
          set.status = 404;
          return {
            error: { code: "NOT_FOUND", message: `Manga part '${id}' not found` },
          };
        }
        const detail = await scrapeMangaDetail(base.wikiPath, base);
        if (!detail) {
          set.status = 404;
          return {
            error: { code: "NOT_FOUND", message: "Detail page returned no data" },
          };
        }
        return detail;
      } catch (err) {
        return scrapeErrorResponse(err, set);
      }
    },
    {
      params: t.Object({ id: t.String({ minLength: 1 }) }),
      response: {
        200: MangaPartDetailModel,
        400: ErrorModel,
        404: ErrorModel,
        502: ErrorModel,
      },
      detail: { summary: "Get a single manga part with general info" },
    },
  );
