import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { dashcamVideos } from "../../db/DashcamVideo.js";
import { dashcamBucket } from "../../storage/bucket.js";

const DOWNLOAD_URL_EXPIRY_MS = 60 * 60 * 1000;

export type DashcamVideoDownloadUrl = {
  videoId: string;
  downloadUrl: string;
  contentType: string;
};

export async function getDashcamVideoDownloadUrl(
  videoId: ObjectId,
): Promise<DashcamVideoDownloadUrl> {
  const video = await dashcamVideos.findOne({ _id: videoId });
  if (!video) throw new HTTPException(404, { message: "Video not found" });

  const [downloadUrl] = await dashcamBucket.file(video.assetPath).getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + DOWNLOAD_URL_EXPIRY_MS,
  });

  return {
    videoId: videoId.toHexString(),
    downloadUrl,
    contentType: "video/mp4",
  };
}
