import type { ObjectId } from "mongodb";
import { db } from "./config.js";

export type DashcamVideo = {
  _id: ObjectId;
  assetPath: string;
  timestamp: Date;
  driverId: ObjectId;
  truckId?: ObjectId;
  deliveryId?: ObjectId;
};

export const dashcamVideos = db.collection<DashcamVideo>("dashcamVideos");
