import { Hono } from "hono";
import { validator } from "hono-openapi";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { computeItinerary } from "../features/itineraries/computeItinerary.js";

const objectIdSchema = z
  .string()
  .refine((s) => ObjectId.isValid(s), "Invalid ID")
  .transform((s) => new ObjectId(s));

const computeItinerarySchema = z.object({
    startPointId: objectIdSchema,
    toVisitIds: z.array(objectIdSchema).min(1),
});

export const itinerariesRoute = new Hono<AuthEnv>()
  // .use("*", requireAuth, requireRole("admin", "driver"))
  .post("/compute", validator("json", computeItinerarySchema), async (c) => {
    const { startPointId, toVisitIds } = c.req.valid("json");
    const itinerary = await computeItinerary({ startPointId, toVisitIds });
    return c.json({ itinerary });
  });
