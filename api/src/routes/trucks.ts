import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { listTrucks } from "../features/trucks/listTrucks.js";
import { createTruck } from "../features/trucks/createTruck.js";

const createTruckSchema = z.object({
  plateNumber: z.string().trim().min(1),
  packageCapacity: z.number().int().positive(),
  fuelType: z.enum(["diesel", "essence", "electrique", "hybride", "gpl"]),
  fuelConsumptionL100km: z.number().positive(),
});

export const trucksRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("admin"))
  .get("/", async (c) => {
    return c.json(await listTrucks());
  })
  .post("/", validator("json", createTruckSchema), async (c) => {
    const truck = await createTruck(c.req.valid("json"));
    return c.json(truck, 201);
  });
