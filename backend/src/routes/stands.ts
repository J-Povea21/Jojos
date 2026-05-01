import { Elysia } from "elysia";
import { scrapeStandsList } from "../scrapers/stands";
import {
  StandListResponseModel,
  StandsQueryModel,
} from "../models/stands";
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

export const standsRoutes = new Elysia({ prefix: "/stands", tags: ["stands"] })
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const list = await scrapeStandsList();
        const partSlug = query.part?.toLowerCase().trim();
        const q = query.q?.toLowerCase().trim();
        return list.filter((s) => {
          if (partSlug && s.partSlug !== partSlug) return false;
          if (q) {
            const haystack = `${s.name} ${s.user ?? ""}`.toLowerCase();
            if (!haystack.includes(q)) return false;
          }
          return true;
        });
      } catch (err) {
        return scrapeErrorResponse(err, set);
      }
    },
    {
      query: StandsQueryModel,
      response: {
        200: StandListResponseModel,
        502: ErrorModel,
      },
      detail: {
        summary: "List JoJo Stands across all parts",
      },
    },
  );
