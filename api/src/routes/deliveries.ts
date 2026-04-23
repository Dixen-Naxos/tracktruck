import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { getDeliveryFuelConsumption } from "../features/deliveries/getFuelConsumption.js";

const deliveryIdParamSchema = z.object({
  deliveryId: z.string().refine((id) => ObjectId.isValid(id), "Invalid delivery ID"),
});

export const deliveriesRoute = new Hono()
  .get(
    "/:deliveryId/fuel-consumption",
    zValidator("param", deliveryIdParamSchema),
    async (c) => {
      const { deliveryId } = c.req.valid("param");
      const result = await getDeliveryFuelConsumption(new ObjectId(deliveryId));
      return c.json(result);
    },
  );
