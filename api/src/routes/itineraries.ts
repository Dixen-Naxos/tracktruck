import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, type AuthEnv } from "../auth/middleware.js";
import { computeItinerary } from "../features/itineraries/computeItinerary.js";
import { previewRoute } from "../features/itineraries/previewRoute.js";
import { zObjectId } from "../utils/idParamSchema.js";

const computeItinerarySchema = z.object({
  startPointId: zObjectId,
  toVisitIds: z.array(zObjectId).min(1),
  departureTime: z.iso.datetime().transform((s) => new Date(s)).optional(),
});

const latLngSchema = z.object({ lat: z.number(), lng: z.number() });

const previewRouteSchema = z.object({
  origin: latLngSchema,
  stops: z.array(latLngSchema).min(1),
});

export const itinerariesRoute = new Hono<AuthEnv>()
  .use("*", requireAuth)
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
              departureTime: "2026-04-25T08:00:00Z",
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
      const { startPointId, toVisitIds, departureTime } = c.req.valid("json");
      const itinerary = await computeItinerary({
        startPointId,
        toVisitIds,
        departureTime,
      });
      return c.json({ itinerary });
    },
  )
  .post(
    "/preview",
    describeRoute({
      summary: "Preview route polyline",
      description:
        "Calls Google Routes API to get the road polyline for a set of raw waypoints. Does not persist anything. The API key stays server-side.",
      tags: ["Itineraries"],
      responses: {
        200: { description: "Decoded polyline + distance + duration" },
        502: { description: "Google Routes API error" },
      },
    }),
    validator("json", previewRouteSchema),
    async (c) => {
      const { origin, stops } = c.req.valid("json");
      const result = await previewRoute({ origin, stops });
      return c.json(result);
    },
  );
