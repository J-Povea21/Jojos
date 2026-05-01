import { t } from "elysia";

export const AnimeStatus = t.Union([
  t.Literal("completed"),
  t.Literal("ongoing"),
  t.Literal("upcoming"),
]);

export const AnimePartModel = t.Object({
  id: t.String(),
  title: t.String(),
  seasonNumber: t.Union([t.Number(), t.Null()]),
  image: t.Union([t.String(), t.Null()]),
  originalRun: t.Union([t.String(), t.Null()]),
  episodes: t.Union([t.Number(), t.Null()]),
  volumes: t.Union([t.Number(), t.Null()]),
  status: AnimeStatus,
  shortDescription: t.Union([t.String(), t.Null()]),
  wikiPath: t.String(),
});

export const CharacterModel = t.Object({
  name: t.String(),
  image: t.Union([t.String(), t.Null()]),
  role: t.Union([t.String(), t.Null()]),
  japaneseVA: t.Union([t.String(), t.Null()]),
  wikiPath: t.Union([t.String(), t.Null()]),
});

export const AnimePartDetailModel = t.Composite([
  AnimePartModel,
  t.Object({
    description: t.String(),
    mainCharacters: t.Array(CharacterModel),
  }),
]);
