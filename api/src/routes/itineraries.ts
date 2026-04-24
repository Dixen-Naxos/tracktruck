import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { ObjectId } from "mongodb";
import { z } from "zod";
import type { AuthEnv } from "../auth/middleware.js";
import {
  computeItinerary,
  resolveWaypointFromId,
} from "../features/itineraries/computeItinerary.js";

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
  .post(
    "/compute",
    describeRoute({
      summary: "Compute optimal itinerary",
      description:
        "Calls Google Routes API to compute the optimal visit order between a start point (warehouse or store) and a list of stops. Does not persist anything.",
      tags: ["Itineraries"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              startPointId: "684a1f2e3c4b5d6e7f8a9b0c",
              toVisitIds: [
                "684a1f2e3c4b5d6e7f8a9b0d",
                "684a1f2e3c4b5d6e7f8a9b0e",
                "684a1f2e3c4b5d6e7f8a9b0f",
              ],
            },
          },
        },
      },
      responses: {
        200: { description: "Optimized itinerary returned" },
        404: { description: "Start point or one of the stops not found" },
        502: { description: "Google Routes API error" },
      },
    }),
    validator("json", computeItinerarySchema),
    async (c) => {
      const { startPointId, toVisitIds } = c.req.valid("json");

      const start = await resolveWaypointFromId(startPointId);
      const stops = await Promise.all(toVisitIds.map(resolveWaypointFromId));

      const itinerary = await computeItinerary({ start, stops });
      return c.json({ itinerary });
    },
  );
