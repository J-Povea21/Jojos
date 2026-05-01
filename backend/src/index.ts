import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { animeRoutes } from "./routes/anime";
import { mangaRoutes } from "./routes/manga";
import { standsRoutes } from "./routes/stands";
import { clearCache, cacheStats } from "./lib/cache";
import { ScrapeError } from "./scrapers/client";

const startedAt = Date.now();
const PORT = Number(process.env.PORT ?? 3001);

const extraOrigins = (process.env.FRONTEND_ORIGIN ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowedOrigins = ["http://localhost:5173", ...extraOrigins];

const app = new Elysia()
  .use(cors({ origin: allowedOrigins }))
  .use(
    swagger({
      path: "/swagger",
      documentation: {
        info: {
          title: "Jojos Backend API",
          version: "0.1.0",
          description:
            "Scrapes jojowiki.com for JoJo anime + manga data. Source of truth for the React frontend.",
        },
        tags: [
          { name: "anime", description: "Anime parts/seasons" },
          { name: "manga", description: "Manga parts" },
          { name: "stands", description: "JoJo Stands across all parts" },
          { name: "system", description: "Health & cache" },
        ],
      },
    }),
  )
  .group("/api", (api) =>
    api
      .get(
        "/health",
        () => ({
          status: "ok" as const,
          uptimeSec: Math.round((Date.now() - startedAt) / 1000),
          cache: cacheStats(),
        }),
        { detail: { tags: ["system"], summary: "Health check" } },
      )
      .delete(
        "/cache",
        () => ({ cleared: clearCache() }),
        { detail: { tags: ["system"], summary: "Clear in-memory scrape cache" } },
      )
      .use(animeRoutes)
      .use(mangaRoutes)
      .use(standsRoutes),
  )
  .onError(({ error, code, set }) => {
    if (error instanceof ScrapeError) {
      set.status = error.status;
      return {
        error: {
          code: error.status === 404 ? "NOT_FOUND" : "SCRAPE_FAILED",
          message: error.message,
        },
      };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return {
        error: { code: "NOT_FOUND", message: "Route not found" },
      };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return {
        error: {
          code: "BAD_REQUEST",
          message: error instanceof Error ? error.message : "Validation failed",
        },
      };
    }
    console.error("[unhandled]", error);
    set.status = 500;
    return {
      error: {
        code: "INTERNAL",
        message: error instanceof Error ? error.message : "Internal error",
      },
    };
  })
  .listen(PORT);

console.log(
  `Jojos backend listening on http://localhost:${PORT}  (swagger: /swagger)`,
);

export type App = typeof app;
