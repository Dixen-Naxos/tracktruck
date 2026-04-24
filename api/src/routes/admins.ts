import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createAdmin } from "../features/admins/createAdmin.js";

const createAdminSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const adminsRoutes = new Hono<AuthEnv>().post(
  "/",
  requireAuth,
  requireRole("admin"),
  validator("json", createAdminSchema),
  async (c) => {
    const admin = await createAdmin(c.req.valid("json"));
    return c.json(admin, 201);
  },
);
