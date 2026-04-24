import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { assignDriverToDelivery } from "../features/deliveries/assignDriver.js";
import { createDelivery } from "../features/deliveries/createDelivery.js";
import { listDeliveries } from "../features/deliveries/listDeliveries.js";
import { idParamSchema } from "../utils/idParamSchema.js";

const objectIdSchema = z
  .string()
  .refine((s) => ObjectId.isValid(s), "Invalid ID")
  .transform((s) => new ObjectId(s));

const createDeliverySchema = z
  .object({
    departureWarehouseId: objectIdSchema,
    plannedStartAt: z.iso.datetime().transform((s) => new Date(s)),
    // Paste the itinerary object returned by POST /itineraries/compute
    itinerary: z.object({
      orderedStopIds: z.array(objectIdSchema).min(1),
      totalDistanceKilometers: z.number().nonnegative(),
      totalDurationSeconds: z.number().nonnegative().int(),
      blockingSigns: z
        .array(z.object({ osmId: z.string() }).passthrough())
        .default([]),
      wasRerouted: z.boolean().default(false),
    }),
    truckId: objectIdSchema.optional(),
    driverId: objectIdSchema.optional(),
  })
  .transform((d) => ({
    departureWarehouseId: d.departureWarehouseId,
    plannedStartAt: d.plannedStartAt,
    orderedStopIds: d.itinerary.orderedStopIds,
    totalDistanceKm: d.itinerary.totalDistanceKilometers,
    totalDurationSeconds: d.itinerary.totalDurationSeconds,
    truckId: d.truckId,
    driverId: d.driverId,
  }));

export const deliveriesRoute = new Hono<AuthEnv>()
  .post(
    "/",
    describeRoute({
      summary: "Create a delivery",
      description:
        "Persists a delivery from an itinerary previously computed by POST /itineraries/compute. No route computation happens here.",
      tags: ["Deliveries"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              departureWarehouseId: "684a1f2e3c4b5d6e7f8a9b0c",
              plannedStartAt: "2026-04-25T08:00:00.000Z",
              itinerary: {
                orderedStopIds: ["684a1f2e3c4b5d6e7f8a9b0d", "684a1f2e3c4b5d6e7f8a9b0e"],
                totalDistanceKilometers: 18.3,
                totalDurationSeconds: 3240,
                blockingSigns: [],
                wasRerouted: false,
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Delivery created" },
        404: { description: "Warehouse not found" },
        409: { description: "Identical delivery already exists" },
      },
    }),
    validator("json", createDeliverySchema),
    async (c) => {
      const body = c.req.valid("json");
      const delivery = await createDelivery(body);
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
