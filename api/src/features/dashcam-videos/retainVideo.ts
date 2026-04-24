import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { dashcamVideos } from "../../db/DashcamVideo.js";

export type RetainVideoResult = {
  videoId: string;
  retained: boolean;
  retentionNote?: string;
  retainedAt?: string;
  retainedBy?: string;
};

export async function retainVideo(
  videoId: ObjectId,
  note: string,
  adminId: ObjectId,
): Promise<RetainVideoResult> {
  const retainedAt = new Date();
  const result = await dashcamVideos.findOneAndUpdate(
    { _id: videoId },
    { $set: { retained: true, retentionNote: note, retainedAt, retainedBy: adminId } },
    { returnDocument: "after" },
  );
  if (!result) throw new HTTPException(404, { message: "Video not found" });

  return {
    videoId: result._id.toHexString(),
    retained: true,
    retentionNote: result.retentionNote,
    retainedAt: result.retainedAt?.toISOString(),
    retainedBy: result.retainedBy?.toHexString(),
  };
}

export async function unretainVideo(videoId: ObjectId): Promise<RetainVideoResult> {
  const result = await dashcamVideos.findOneAndUpdate(
    { _id: videoId },
    { $unset: { retained: "", retentionNote: "", retainedAt: "", retainedBy: "" } },
    { returnDocument: "after" },
  );
  if (!result) throw new HTTPException(404, { message: "Video not found" });

  return { videoId: result._id.toHexString(), retained: false };
}
