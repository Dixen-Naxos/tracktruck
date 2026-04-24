import { dashcamVideos } from "../../db/DashcamVideo.js";
import { dashcamBucket } from "../../storage/bucket.js";

const RETENTION_DAYS = Number(process.env.VIDEO_RETENTION_DAYS ?? 30);

export async function cleanupOldVideos(): Promise<{ deleted: number; errors: number }> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const toDelete = await dashcamVideos
    .find({ timestamp: { $lt: cutoff }, retained: { $ne: true } })
    .toArray();

  if (toDelete.length === 0) {
    console.log("[cleanup] No videos to delete.");
    return { deleted: 0, errors: 0 };
  }

  let deleted = 0;
  let errors = 0;

  for (const video of toDelete) {
    try {
      await dashcamBucket.file(video.assetPath).delete({ ignoreNotFound: true });
      await dashcamVideos.deleteOne({ _id: video._id });
      deleted++;
    } catch (err) {
      errors++;
      console.error(`[cleanup] Failed to delete video ${video._id.toHexString()}:`, err);
    }
  }

  console.log(`[cleanup] Done — deleted: ${deleted}, errors: ${errors}`);
  return { deleted, errors };
}
