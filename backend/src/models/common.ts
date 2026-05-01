import { t } from "elysia";

export const ErrorModel = t.Object({
  error: t.Object({
    code: t.String(),
    message: t.String(),
  }),
});
