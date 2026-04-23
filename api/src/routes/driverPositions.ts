import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createTruckPositionTrace } from "../features/positions/createTruckPositionTrace.js";

const createDriverPositionSchema = z.object({
  position: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),
  timestamp: z.iso.datetime().transform((s) => new Date(s)).optional(),
});

export const driverPositionsRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("driver"))
  .post("/positions", validator("json", createDriverPositionSchema), async (c) => {
    const driver = c.get("user");
    const trace = await createTruckPositionTrace(driver._id, c.req.valid("json"));
    return c.json(trace, 201);
  });