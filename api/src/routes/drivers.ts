import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createDriver } from "../features/drivers/createDriver.js";

const createDriverSchema = z.object({
  email: z.email().transform((s) => s.trim().toLowerCase()),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export const driversRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("admin"))
  .post("/", zValidator("json", createDriverSchema), async (c) => {
    const driver = await createDriver(c.req.valid("json"));
    return c.json(driver, 201);
  });
