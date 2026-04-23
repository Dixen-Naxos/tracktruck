import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createDriver } from "../features/drivers/createDriver.js";
import { deleteDriver } from "../features/drivers/deleteDriver.js";
import { getDriver } from "../features/drivers/getDriver.js";
import { listDrivers } from "../features/drivers/listDrivers.js";
import { updateDriver } from "../features/drivers/updateDriver.js";
import { idParamSchema } from "../utils/idParamSchema.js";

const createDriverSchema = z.object({
  email: z.email().transform((s) => s.trim().toLowerCase()),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

const updateDriverSchema = z
  .object({
    firstName: z.string().trim().min(1).optional(),
    lastName: z.string().trim().min(1).optional(),
  })
  .refine((v) => v.firstName !== undefined || v.lastName !== undefined, {
    message: "At least one field must be provided",
  });

export const driversRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("admin"))
  .post("/", validator("json", createDriverSchema), async (c) => {
    const driver = await createDriver(c.req.valid("json"));
    return c.json(driver, 201);
  })
  .get("/", async (c) => {
    return c.json(await listDrivers());
  })
  .get("/:id", validator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await getDriver(id));
  })
  .patch(
    "/:id",
    validator("param", idParamSchema),
    validator("json", updateDriverSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      return c.json(await updateDriver(id, c.req.valid("json")));
    },
  )
  .delete("/:id", validator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await deleteDriver(id);
    return c.body(null, 204);
  });
