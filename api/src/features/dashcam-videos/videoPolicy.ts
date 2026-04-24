import { settings } from "../../db/Settings.js";

const KEY = "videoRetentionDays";
const ENV_FALLBACK = Number(process.env.VIDEO_RETENTION_DAYS ?? 30);

export type VideoPolicy = { retentionDays: number };

export async function getVideoPolicy(): Promise<VideoPolicy> {
  const doc = await settings.findOne({ key: KEY });
  const retentionDays = typeof doc?.value === "number" ? doc.value : ENV_FALLBACK;
  return { retentionDays };
}

export async function setVideoPolicy(retentionDays: number): Promise<VideoPolicy> {
  await settings.updateOne(
    { key: KEY },
    { $set: { value: retentionDays } },
    { upsert: true },
  );
  return { retentionDays };
}
