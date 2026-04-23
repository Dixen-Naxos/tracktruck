import { ObjectId } from "mongodb";
import { dashcamVideos } from "../../db/DashcamVideo.js";
import { dashcamBucket } from "../../storage/bucket.js";

const UPLOAD_URL_EXPIRY_MS = 15 * 60 * 1000;
const UPLOAD_CONTENT_TYPE = "video/mp4";

export type DashcamVideoUpload = {
  videoId: string;
  assetPath: string;
  uploadUrl: string;
  contentType: string;
};

export async function createDashcamVideoUpload(
  driverId: ObjectId,
  timestamp: Date,
): Promise<DashcamVideoUpload> {
  const videoId = new ObjectId();
  const assetPath = `dashcam-videos/${driverId.toHexString()}/${timestamp.getTime()}-${videoId.toHexString()}.mp4`;

  await dashcamVideos.insertOne({
    _id: videoId,
    assetPath,
    timestamp,
    driverId,
  });

  const [uploadUrl] = await dashcamBucket.file(assetPath).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + UPLOAD_URL_EXPIRY_MS,
    contentType: UPLOAD_CONTENT_TYPE,
  });

  return {
    videoId: videoId.toHexString(),
    assetPath,
    uploadUrl,
    contentType: UPLOAD_CONTENT_TYPE,
  };
}
