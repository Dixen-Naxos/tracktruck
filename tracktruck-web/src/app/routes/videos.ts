import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createDashcamVideoUpload } from "../features/dashcam-videos/createUpload.js";
import { getDashcamVideoDownloadUrl } from "../features/dashcam-videos/getDownloadUrl.js";
import { listDashcamVideos } from "../features/dashcam-videos/listVideos.js";

const uploadUrlSchema = z.object({
  timestamp: z.iso.datetime().transform((s) => new Date(s)),
});

const videoIdParamSchema = z.object({
  videoId: z.string().refine((id) => ObjectId.isValid(id), "Invalid video ID"),
});

export const videosRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    const videos = await listDashcamVideos();
    return c.json(videos);
  })
  .post(
    "/upload-url",
    requireAuth,
    requireRole("driver"),
    zValidator("json", uploadUrlSchema),
    async (c) => {
      const { timestamp } = c.req.valid("json");
      const driver = c.get("user");
      const upload = await createDashcamVideoUpload(driver._id, timestamp);
      return c.json(upload);
    },
  )
  .get(
    "/:videoId/download-url",
    zValidator("param", videoIdParamSchema),
    async (c) => {
      const { videoId } = c.req.valid("param");
      const result = await getDashcamVideoDownloadUrl(new ObjectId(videoId));
      return c.json(result);
    },
  );
