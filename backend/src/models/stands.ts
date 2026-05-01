import { t } from "elysia";

export const StandModel = t.Object({
  id: t.String(),
  name: t.String(),
  user: t.Union([t.String(), t.Null()]),
  part: t.String(),
  partSlug: t.String(),
  image: t.Union([t.String(), t.Null()]),
  ability: t.Union([t.String(), t.Null()]),
  wikiPath: t.String(),
});

export const StandListResponseModel = t.Array(StandModel);

export const StandsQueryModel = t.Object({
  q: t.Optional(t.String()),
  part: t.Optional(t.String()),
});
