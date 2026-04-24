import { Hono } from "hono";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { listOrders } from "../features/orders/listOrders.js";

export const ordersRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("admin"))
  .get("/", async (c) => {
    return c.json(await listOrders());
  });