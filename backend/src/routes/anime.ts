import { Elysia, t } from "elysia";
import { scrapeAnimeList, scrapeAnimeDetail } from "../scrapers/anime";
import {
  AnimePartModel,
  AnimePartDetailModel,
} from "../models/anime";
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

export const animeRoutes = new Elysia({ prefix: "/anime", tags: ["anime"] })
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const list = await scrapeAnimeList();
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
        200: t.Array(AnimePartModel),
        404: ErrorModel,
        502: ErrorModel,
      },
      detail: { summary: "List JoJo anime parts/seasons" },
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
        const list = await scrapeAnimeList();
        const base = list.find((p) => p.id === id);
        if (!base) {
          set.status = 404;
          return {
            error: { code: "NOT_FOUND", message: `Anime part '${id}' not found` },
          };
        }
        const detail = await scrapeAnimeDetail(base.wikiPath, base);
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
        200: AnimePartDetailModel,
        400: ErrorModel,
        404: ErrorModel,
        502: ErrorModel,
      },
      detail: { summary: "Get a single anime part with main characters" },
    },
  );
