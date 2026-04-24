import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createWarehouse } from "../features/warehouses/createWarehouse.js";
import { deleteWarehouse } from "../features/warehouses/deleteWarehouse.js";
import { getWarehouse } from "../features/warehouses/getWarehouse.js";
import { listWarehouses } from "../features/warehouses/listWarehouses.js";
import { updateWarehouse } from "../features/warehouses/updateWarehouse.js";
import { idParamSchema } from "../utils/idParamSchema.js";

const createWarehouseSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
});

const updateWarehouseSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    address: z.string().trim().min(1).optional(),
  })
  .refine((v) => v.name !== undefined || v.address !== undefined, {
    message: "At least one field must be provided",
  });

export const warehousesRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("admin"))
  .post("/", validator("json", createWarehouseSchema), async (c) => {
    const warehouse = await createWarehouse(c.req.valid("json"));
    return c.json(warehouse, 201);
  })
  .get("/", async (c) => {
    return c.json(await listWarehouses());
  })
  .get("/:id", validator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await getWarehouse(id));
  })
  .patch(
    "/:id",
    validator("param", idParamSchema),
    validator("json", updateWarehouseSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      return c.json(await updateWarehouse(id, c.req.valid("json")));
    },
  )
  .delete("/:id", validator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await deleteWarehouse(id);
    return c.body(null, 204);
  });
