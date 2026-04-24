import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { requireAuth, type AuthEnv } from "../auth/middleware.js";
import { listTrucks } from "../features/trucks/listTrucks.js";
import { getTruck } from "../features/trucks/getTruck.js";
import { idParamSchema } from "../utils/idParamSchema.js";

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
  );
