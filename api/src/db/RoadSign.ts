import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type RoadSignType = "hgv_forbidden" | "maxheight" | "maxweight" | "maxwidth";

export type RoadSign = {
  _id: ObjectId;
  osmId: string;
  osmType: "node" | "way";
  type: RoadSignType;
  /** Value in metres (height/width) or tonnes (weight). Absent for hgv_forbidden. */
  value?: number;
  location: { lat: number; lng: number };
  /** Raw OSM tags for reference */
  tags: Record<string, string>;
  fetchedAt: Date;
};

export const roadSigns = db.collection<RoadSign>("roadSigns");

export async function ensureRoadSignIndexes() {
  // Unique per OSM element
  await roadSigns.createIndex({ osmId: 1, osmType: 1 }, { unique: true });
  // Geo index for proximity queries
  await roadSigns.createIndex({ location: "2dsphere" });
  // TTL: auto-expire after 7 days so data stays fresh
  await roadSigns.createIndex({ fetchedAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });
}
