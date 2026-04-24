import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createIncident } from "../features/incidents/createIncident.js";
import { zObjectId } from "../utils/idParamSchema.js";
import { listIncidents } from "../features/incidents/listIncidents.js";

const gpsPositionSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const deliveryIncidentBase = {
  deliveryId: zObjectId,
  position: gpsPositionSchema,
  comment: z.string().trim().min(1).optional(),
};

const createIncidentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("delivery_delayed"),
    ...deliveryIncidentBase,
    expectedDelayMinutes: z.number().int().positive().optional(),
  }),
  z.object({
    type: z.literal("vehicle_breakdown"),
    ...deliveryIncidentBase,
  }),
  z.object({
    type: z.literal("accident"),
    ...deliveryIncidentBase,
  }),
  z.object({
    type: z.literal("obstacle"),
    ...deliveryIncidentBase,
  }),
  z.object({
    type: z.literal("other"),
    ...deliveryIncidentBase,
  }),
]);

const listIncidentsQuerySchema = z.object({
  deliveryId: zObjectId.optional(),
});

export const driverIncidentsRoute = new Hono<AuthEnv>()
  .use("*", requireAuth)
  .get(
    "/",
    requireRole("admin"),
    validator("query", listIncidentsQuerySchema),
    async (c) => {
      const incidents = await listIncidents(c.req.valid("query"));
      return c.json(incidents);
    },
  )
  .post(
    "/",
    requireRole("driver"),
    validator("json", createIncidentSchema),
    async (c) => {
      const driver = c.get("user");
      const incident = await createIncident(driver._id, c.req.valid("json"));
      return c.json(incident, 201);
    },
  );
