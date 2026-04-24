import { Hono } from "hono";
import { describeRoute, validator } from "hono-openapi";
import { ObjectId } from "mongodb";
import { z } from "zod";
import { requireAuth, requireRole, type AuthEnv } from "../auth/middleware.js";
import { createDashcamVideoUpload } from "../features/dashcam-videos/createUpload.js";
import { getDashcamVideoDownloadUrl } from "../features/dashcam-videos/getDownloadUrl.js";
import { listDashcamVideos } from "../features/dashcam-videos/listVideos.js";
import { retainVideo, unretainVideo } from "../features/dashcam-videos/retainVideo.js";

const uploadUrlSchema = z.object({
  timestamp: z.iso.datetime().transform((s) => new Date(s)),
});

const listQuerySchema = z.object({
  from: z.iso
    .datetime()
    .transform((s) => new Date(s))
    .optional(),
  to: z.iso
    .datetime()
    .transform((s) => new Date(s))
    .optional(),
});

const videoIdParamSchema = z.object({
  videoId: z.string().refine((id) => ObjectId.isValid(id), "Invalid video ID"),
});

const retainBodySchema = z.object({
  note: z.string().min(1),
});

export const videosRoute = new Hono<AuthEnv>()
  .get(
    "/",
    describeRoute({
      summary: "List dashcam videos",
      tags: ["Videos"],
      responses: { 200: { description: "List of dashcam videos" } },
    }),
    requireAuth,
    requireRole("admin"),
    validator("query", listQuerySchema),
    async (c) => {
      const { from, to } = c.req.valid("query");
      const videos = await listDashcamVideos(from, to);
      return c.json(videos);
    },
  )
  .post(
    "/upload-url",
    requireAuth,
    requireRole("driver"),
    describeRoute({
      summary: "Get a signed upload URL for a dashcam video",
      tags: ["Videos"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Signed upload URL" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
      },
    }),
    validator("json", uploadUrlSchema),
    async (c) => {
      const { timestamp } = c.req.valid("json");
      const driver = c.get("user");
      const upload = await createDashcamVideoUpload(driver._id, timestamp);
      return c.json(upload);
    },
  )
  .get(
    "/:videoId/download-url",
    describeRoute({
      summary: "Get a signed download URL for a dashcam video",
      tags: ["Videos"],
      responses: {
        200: { description: "Signed download URL" },
        404: { description: "Video not found" },
      },
    }),
    requireAuth,
    requireRole("admin"),
    validator("param", videoIdParamSchema),
    async (c) => {
      const { videoId } = c.req.valid("param");
      const result = await getDashcamVideoDownloadUrl(new ObjectId(videoId));
      return c.json(result);
    },
  )
  .patch(
    "/:videoId/retain",
    describeRoute({
      summary: "Mark a video for permanent retention",
      description: "Marks the video as retained with an annotation. Retained videos are excluded from automatic deletion.",
      tags: ["Videos"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Video marked as retained" },
        404: { description: "Video not found" },
      },
    }),
    requireAuth,
    requireRole("admin"),
    validator("param", videoIdParamSchema),
    validator("json", retainBodySchema),
    async (c) => {
      const { videoId } = c.req.valid("param");
      const { note } = c.req.valid("json");
      const admin = c.get("user");
      return c.json(await retainVideo(new ObjectId(videoId), note, admin._id));
    },
  )
  .delete(
    "/:videoId/retain",
    describeRoute({
      summary: "Remove retention mark from a video",
      description: "Removes the retention annotation. The video becomes eligible for automatic deletion again.",
      tags: ["Videos"],
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: "Retention removed" },
        404: { description: "Video not found" },
      },
    }),
    requireAuth,
    requireRole("admin"),
    validator("param", videoIdParamSchema),
    async (c) => {
      const { videoId } = c.req.valid("param");
      return c.json(await unretainVideo(new ObjectId(videoId)));
    },
  );
