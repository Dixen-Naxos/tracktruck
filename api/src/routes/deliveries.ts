import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createDelivery } from "../features/deliveries/createDelivery.js";
import { listDeliveries } from "../features/deliveries/listDeliveries.js";
import { getDeliveryFuelConsumption } from "../features/deliveries/getFuelConsumption.js";
import { getDeliveryTripCost } from "../features/deliveries/getTripCost.js";
import { computeItinerary } from "../features/itineraries/computeItinerary.js";
import { idParamSchema, zObjectId } from "../utils/idParamSchema.js";
import { assignDriverToDelivery } from "../features/deliveries/assignDriver.js";

const objectIdSchema = z
  .string()
  .refine((s) => ObjectId.isValid(s), "Invalid ID")
  .transform((s) => new ObjectId(s));

const deliveryIdParamSchema = z.object({
  deliveryId: objectIdSchema,
});

const createDeliverySchema = z.object({
  departureWarehouseId: objectIdSchema,
  /** IDs of stores to visit (order will be optimized by Google) */
  storeIds: z.array(objectIdSchema).min(1),
  plannedStartAt: z.iso.datetime().transform((s) => new Date(s)),
});

export const deliveriesRoute = new Hono<AuthEnv>()
  .use("*", requireAuth)
  .post(
    "/",
    describeRoute({
      summary: "Create a delivery",
      description:
        "Computes the optimal itinerary via Google Routes API then persists the delivery. Returns 409 if an identical delivery already exists.",
      tags: ["Deliveries"],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            example: {
              departureWarehouseId: "684a1f2e3c4b5d6e7f8a9b0c",
              storeIds: [
                "684a1f2e3c4b5d6e7f8a9b0d",
                "684a1f2e3c4b5d6e7f8a9b0e",
              ],
              plannedStartAt: "2026-04-25T08:00:00.000Z",
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
    requireRole("admin"),
    validator("json", createDeliverySchema),
    async (c) => {
      const { departureWarehouseId, storeIds, plannedStartAt } =
        c.req.valid("json");

      const itineraryResult = await computeItinerary({
        startPointId: departureWarehouseId,
        toVisitIds: storeIds,
      });

      const delivery = await createDelivery({
        departureWarehouseId,
        plannedStartAt,
        itineraryResult,
      });

      return c.json(delivery, 201);
    },
  )
  .get(
    "/",
    describeRoute({
      summary: "List all deliveries",
      tags: ["Deliveries"],
      responses: {
        200: { description: "List of deliveries" },
      },
    }),
    async (c) => {
      const user = c.get("user");
      if (user.role === "driver") {
        return c.json(await listDeliveries({ driverId: user._id }));
      }
      return c.json(await listDeliveries());
    },
  )
  .get(
    "/:deliveryId/fuel-consumption",
    describeRoute({
      summary: "Get fuel consumption for a delivery",
      description:
        "Returns the fuel consumption in liters based on the truck assigned to the delivery and its total distance.",
      tags: ["Deliveries"],
      responses: {
        200: { description: "Fuel consumption details" },
        404: { description: "Delivery or truck not found" },
        422: { description: "No truck or distance assigned" },
      },
    }),
    requireRole("admin"),
    validator("param", deliveryIdParamSchema),
    async (c) => {
      const { deliveryId } = c.req.valid("param");
      return c.json(await getDeliveryFuelConsumption(deliveryId));
    },
  )
  .get(
    "/:deliveryId/trip-cost",
    describeRoute({
      summary: "Get the fuel cost of a delivery",
      description:
        "Calculates the total fuel cost based on the truck's consumption, the delivery's distance, and the live price per liter fetched from prix-carburants.2aaz.fr.",
      tags: ["Deliveries"],
      responses: {
        200: { description: "Trip cost breakdown" },
        404: { description: "Delivery or truck not found" },
        422: {
          description:
            "No truck assigned or fuel type has no price (e.g. electric)",
        },
        502: { description: "Fuel price API error" },
      },
    }),
    requireRole("admin"),
    validator("param", deliveryIdParamSchema),
    async (c) => {
      const { deliveryId } = c.req.valid("param");
      return c.json(await getDeliveryTripCost(deliveryId));
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
    requireRole("admin"),
    validator("param", idParamSchema),
    validator(
      "json",
      z.object({
        driverId: zObjectId.nullable(),
      }),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { driverId } = c.req.valid("json");
      const delivery = await assignDriverToDelivery(id, driverId);
      return c.json(delivery);
    },
  );
