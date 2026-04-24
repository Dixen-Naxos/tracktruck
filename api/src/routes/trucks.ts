import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { listTrucks } from "../features/trucks/listTrucks.js";
import { getTruck } from "../features/trucks/getTruck.js";
import { createTruck } from "../features/trucks/createTruck.js";
import { idParamSchema } from "../utils/idParamSchema.js";

const createTruckSchema = z.object({
  plateNumber: z.string().trim().min(1),
  packageCapacity: z.number().int().positive(),
  fuelType: z.enum(["diesel", "essence", "electrique", "hybride", "gpl"]),
  fuelConsumptionL100km: z.number().positive(),
});

export const trucksRoute = new Hono<AuthEnv>()
  .use("*", requireAuth)
  .get(
    "/",
    describeRoute({
      summary: "List trucks with live status",
      description:
        "Returns every truck with its current active delivery (if any), the assigned driver, the stop list, and the most recent GPS position.",
      tags: ["Trucks"],
      responses: {
        200: { description: "List of enriched trucks" },
      },
    }),
    async (c) => {
      return c.json(await listTrucks());
    },
  )
  .get(
    "/:id",
    describeRoute({
      summary: "Get a single truck with live status",
      tags: ["Trucks"],
      responses: {
        200: { description: "Enriched truck" },
        404: { description: "Truck not found" },
      },
    }),
    validator("param", idParamSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      return c.json(await getTruck(id));
    },
  )
  .post(
    "/",
    describeRoute({
      summary: "Create a new truck (admin only)",
      tags: ["Trucks"],
      responses: {
        201: { description: "Truck created" },
        409: { description: "Plate number already exists" },
      },
    }),
    requireRole("admin"),
    validator("json", createTruckSchema),
    async (c) => {
      const truck = await createTruck(c.req.valid("json"));
      return c.json(truck, 201);
    },
  );
