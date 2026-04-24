import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { assignDriverToDelivery } from "../features/deliveries/assignDriver.js";
import { createDelivery } from "../features/deliveries/createDelivery.js";
import { listDeliveries } from "../features/deliveries/listDeliveries.js";
import {
  computeItinerary,
  resolveWaypointFromId,
  type ItineraryWaypoint,
} from "../features/itineraries/computeItinerary.js";
import { stores, type Store } from "../db/Store.js";
import { idParamSchema } from "../utils/idParamSchema.js";

const objectIdSchema = z
  .string()
  .refine((s) => ObjectId.isValid(s), "Invalid ID")
  .transform((s) => new ObjectId(s));

const adHocStopSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().default(""),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

const createDeliverySchema = z
  .object({
    departureWarehouseId: objectIdSchema,
    /** Existing store IDs (visit order will be optimized by Google). */
    storeIds: z.array(objectIdSchema).optional(),
    /** Arbitrary points — addresses or coordinates picked on the map. */
    stops: z.array(adHocStopSchema).optional(),
    plannedStartAt: z.iso.datetime().transform((s) => new Date(s)),
    truckId: objectIdSchema.optional(),
    driverId: objectIdSchema.optional(),
  })
  .refine(
    (v) => (v.storeIds?.length ?? 0) + (v.stops?.length ?? 0) >= 1,
    { message: "Provide at least one storeId or one stop" },
  );

/**
 * For an ad-hoc waypoint, either reuse an existing Store at the same
 * coordinates or create a new one. This keeps Delivery.storeIds valid.
 */
async function materializeAdHocStop(wp: ItineraryWaypoint): Promise<ObjectId> {
  if (wp.existingStoreId) return wp.existingStoreId;

  // Cheap proximity match (~11m) on exact coordinates to avoid duplicates.
  const epsilon = 0.0001;
  const existing = await stores.findOne({
    "location.lat": { $gte: wp.location.lat - epsilon, $lte: wp.location.lat + epsilon },
    "location.lng": { $gte: wp.location.lng - epsilon, $lte: wp.location.lng + epsilon },
  });
  if (existing) return existing._id;

  const created: Store = {
    _id: new ObjectId(),
    name: wp.name,
    address: wp.address || `${wp.location.lat.toFixed(5)}, ${wp.location.lng.toFixed(5)}`,
    location: wp.location,
  };
  await stores.insertOne(created);
  return created._id;
}

export const deliveriesRoute = new Hono<AuthEnv>()
  // .use("*", requireAuth, requireRole("admin"))
  .post(
    "/",
    describeRoute({
      summary: "Create a delivery",
      description:
        "Computes the optimal itinerary via Google Routes API then persists the delivery. Accepts either existing storeIds and/or ad-hoc stops (with coordinates). A truck and driver can be assigned inline.",
      tags: ["Deliveries"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              departureWarehouseId: "684a1f2e3c4b5d6e7f8a9b0c",
              stops: [
                {
                  name: "Client Bastille",
                  address: "5 Place de la Bastille, 75004 Paris",
                  location: { lat: 48.853, lng: 2.369 },
                },
              ],
              plannedStartAt: "2026-04-25T08:00:00.000Z",
              truckId: "684a1f2e3c4b5d6e7f8a9b11",
              driverId: "684a1f2e3c4b5d6e7f8a9b12",
            },
          },
        },
      },
      responses: {
        201: { description: "Delivery created" },
        404: { description: "Warehouse or store not found" },
        409: { description: "Identical delivery already exists" },
        502: { description: "Google Routes API error" },
      },
    }),
    validator("json", createDeliverySchema),
    async (c) => {
      const { departureWarehouseId, storeIds, stops, plannedStartAt, truckId, driverId } =
        c.req.valid("json");

      const start = await resolveWaypointFromId(departureWarehouseId);

      const resolvedFromIds: ItineraryWaypoint[] = storeIds
        ? await Promise.all(storeIds.map(resolveWaypointFromId))
        : [];

      const adHoc: ItineraryWaypoint[] = (stops ?? []).map((s) => ({
        name: s.name,
        address: s.address,
        location: s.location,
      }));

      const allStops = [...resolvedFromIds, ...adHoc];
      if (allStops.length === 0) {
        throw new HTTPException(400, {
          message: "At least one stop is required",
        });
      }

      const itineraryResult = await computeItinerary({ start, stops: allStops });

      // Materialize every ordered stop into a Store doc so storeIds stays valid.
      const orderedStopIds = await Promise.all(
        itineraryResult.orderedStops.map(materializeAdHocStop),
      );

      const delivery = await createDelivery({
        departureWarehouseId,
        plannedStartAt,
        totalDistanceKm: itineraryResult.totalDistanceKilometers,
        totalDurationSeconds: itineraryResult.totalDurationSeconds,
        orderedStopIds,
        truckId,
        driverId,
      });

      return c.json(delivery, 201);
    },
  )
  .get(
    "/",
    describeRoute({
      summary: "List deliveries",
      description:
        "Admins get every delivery. Drivers get only the deliveries assigned to them.",
      tags: ["Deliveries"],
      responses: {
        200: { description: "List of deliveries" },
      },
    }),
    requireAuth,
    async (c) => {
      const user = c.get("user");
      if (user.role === "driver") {
        return c.json(await listDeliveries({ driverId: user._id }));
      }
      return c.json(await listDeliveries());
    },
  )
  .put(
    "/:id/driver",
    describeRoute({
      summary: "Assign or reassign a driver to a delivery (admin only)",
      description:
        "Sets the driver of a delivery. Pass `driverId: null` to unassign.",
      tags: ["Deliveries"],
      responses: {
        200: { description: "Driver assigned" },
        400: { description: "Target user is not a driver" },
        403: { description: "Forbidden — admin role required" },
        404: { description: "Delivery or driver not found" },
      },
    }),
    requireAuth,
    requireRole("admin"),
    validator("param", idParamSchema),
    validator(
      "json",
      z.object({
        driverId: z.union([objectIdSchema, z.null()]),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { driverId } = c.req.valid("json");
      const delivery = await assignDriverToDelivery(id, driverId);
      return c.json(delivery);
    },
  );
