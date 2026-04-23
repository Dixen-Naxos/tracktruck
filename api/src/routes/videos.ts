import { Hono } from "hono";
import { validator } from "hono-openapi";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createDashcamVideoUpload } from "../features/dashcam-videos/createUpload.js";

const uploadUrlSchema = z.object({
  timestamp: z.iso.datetime().transform((s) => new Date(s)),
});

export const videosRoute = new Hono<AuthEnv>()
  .use("*", requireAuth, requireRole("driver"))
  .post("/upload-url", validator("json", uploadUrlSchema), async (c) => {
    const { timestamp } = c.req.valid("json");
    const driver = c.get("user");
    const upload = await createDashcamVideoUpload(driver._id, timestamp);
    return c.json(upload);
  });
