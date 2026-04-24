import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import type { AuthEnv } from "../auth/middleware.js";
import { requireAuth, requireRole } from "../auth/middleware.js";
import { syncRoadSigns } from "../features/road-signs/syncRoadSigns.js";

const bboxSchema = z.object({
  south: z.coerce.number(),
  west: z.coerce.number(),
  north: z.coerce.number(),
  east: z.coerce.number(),
});

export const roadSignsRoute = new Hono<AuthEnv>().post(
  "/sync",
  describeRoute({
    summary: "Sync road signs from OpenStreetMap for a given bounding box",
    tags: ["Road Signs"],
    responses: {
      200: { description: "Sync completed" },
    },
    requestBody: {
      content: {
        "application/json": {
          example: {
            south: 48.815,
            west: 2.224,
            north: 48.902,
            east: 2.469,
          },
        },
      },
    },
  }),
  requireAuth,
  requireRole("admin"),
  validator("json", bboxSchema),
  async (c) => {
    const bbox = c.req.valid("json");
    const result = await syncRoadSigns(bbox);
    return c.json(result);
  },
);
