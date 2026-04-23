import { dashcamVideos } from "../../db/DashcamVideo.js";

export type DashcamVideoSummary = {
  id: string;
  assetPath: string;
  timestamp: string;
  driverId: string;
  driverName: string;
  truckId?: string;
  deliveryId?: string;
};

export async function listDashcamVideos(): Promise<DashcamVideoSummary[]> {
  const results = await dashcamVideos
    .aggregate<{
      _id: import("mongodb").ObjectId;
      assetPath: string;
      timestamp: Date;
      driverId: import("mongodb").ObjectId;
      truckId?: import("mongodb").ObjectId;
      deliveryId?: import("mongodb").ObjectId;
      driver?: { firstName?: string; lastName?: string };
    }>([
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
    driverId: v.driverId.toHexString(),
    driverName: v.driver
      ? `${v.driver.firstName ?? ""} ${v.driver.lastName ?? ""}`.trim() || "Inconnu"
      : "Inconnu",
    truckId: v.truckId?.toHexString(),
    deliveryId: v.deliveryId?.toHexString(),
  }));
}
