import { t } from "elysia";

export const MangaStatus = t.Union([
  t.Literal("completed"),
  t.Literal("ongoing"),
]);

export const MangaPartModel = t.Object({
  id: t.String(),
  title: t.String(),
  partNumber: t.Union([t.Number(), t.Null()]),
  image: t.Union([t.String(), t.Null()]),
  originalRun: t.Union([t.String(), t.Null()]),
  chapters: t.Union([t.Number(), t.Null()]),
  volumes: t.Union([t.Number(), t.Null()]),
  author: t.String(),
  status: MangaStatus,
  shortDescription: t.Union([t.String(), t.Null()]),
  wikiPath: t.String(),
});

export const MangaPartDetailModel = t.Composite([
  MangaPartModel,
  t.Object({
    description: t.String(),
  }),
]);
