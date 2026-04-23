import type { ObjectId } from "mongodb";
import { dashcamVideos } from "../../db/DashcamVideo.js";

type AggResult = {
  _id: ObjectId;
  assetPath: string;
  timestamp: Date;
  driverId: ObjectId;
  truckId?: ObjectId;
  deliveryId?: ObjectId;
  driver?: { _id: ObjectId; firstName?: string; lastName?: string };
};

export type DashcamVideoSummary = {
  id: string;
  assetPath: string;
  timestamp: string;
  driver: { id: string; firstName: string; lastName: string } | null;
  truckId?: string;
  deliveryId?: string;
};

export async function listDashcamVideos(): Promise<DashcamVideoSummary[]> {
  const results = await dashcamVideos
    .aggregate<AggResult>([
      { $sort: { timestamp: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "driverId",
          foreignField: "_id",
          as: "driver",
        },
      },
      { $unwind: { path: "$driver", preserveNullAndEmptyArrays: true } },
    ])
    .toArray();

  return results.map((v) => ({
    id: v._id.toHexString(),
    assetPath: v.assetPath,
    timestamp: v.timestamp.toISOString(),
    driver: v.driver?.firstName
      ? {
          id: v.driver._id.toHexString(),
          firstName: v.driver.firstName,
          lastName: v.driver.lastName ?? "",
        }
      : null,
    truckId: v.truckId?.toHexString(),
    deliveryId: v.deliveryId?.toHexString(),
  }));
}
