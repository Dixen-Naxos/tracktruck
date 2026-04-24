import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createStore } from "../features/stores/createStore.js";
import { deleteStore } from "../features/stores/deleteStore.js";
import { getStore } from "../features/stores/getStore.js";
import { listStores } from "../features/stores/listStores.js";
import { updateStore } from "../features/stores/updateStore.js";
import { idParamSchema } from "../utils/idParamSchema.js";

const createStoreSchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
});

const updateStoreSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    address: z.string().trim().min(1).optional(),
  })
  .refine((v) => v.name !== undefined || v.address !== undefined, {
    message: "At least one field must be provided",
  });

export const storesRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("admin"))
  .post("/", validator("json", createStoreSchema), async (c) => {
    const store = await createStore(c.req.valid("json"));
    return c.json(store, 201);
  })
  .get("/", async (c) => {
    return c.json(await listStores());
  })
  .get("/:id", validator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await getStore(id));
  })
  .patch(
    "/:id",
    validator("param", idParamSchema),
    validator("json", updateStoreSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      return c.json(await updateStore(id, c.req.valid("json")));
    },
  )
  .delete("/:id", validator("param", idParamSchema), async (c) => {
    const { id } = c.req.valid("param");
    await deleteStore(id);
    return c.body(null, 204);
  });
