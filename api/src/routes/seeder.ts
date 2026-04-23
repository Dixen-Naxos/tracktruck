import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import type { AuthEnv } from "../auth/middleware.js";
import { runSeed } from "../features/seed/runSeed.js";

export const seederRoute = new Hono<AuthEnv>().post(
  "/",
  describeRoute({
    tags: ["seeder"],
    summary: "Wipe and reseed the database with demo data",
    responses: {
      201: { description: "Seed complete — returns counts of inserted entities" },
    },
  }),
  async (c) => {
    const result = await runSeed();
    return c.json(result, 201);
  },
);
