import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { deliveries, type Delivery, type InlineStop } from "../../db/Delivery.js";

export type CreateDeliveryInput = {
  departureWarehouseId: ObjectId;
  plannedStartAt: Date;
  totalDistanceKm: number;
  totalDurationSeconds: number;
  /** Mobile flow: ordered Store ObjectIds */
  storeIds?: ObjectId[];
  /** Web flow: inline stop objects */
  stops?: InlineStop[];
  truckId?: ObjectId;
  driverId?: ObjectId;
  roadSignIds?: string[];
  wasRerouted?: boolean;
};

export async function createDelivery(
  input: CreateDeliveryInput,
): Promise<Delivery> {
  const {
    departureWarehouseId,
    plannedStartAt,
    totalDistanceKm,
    totalDurationSeconds,
    storeIds,
    stops,
    truckId,
    driverId,
    roadSignIds,
    wasRerouted,
  } = input;

  if (!storeIds?.length && !stops?.length) {
    throw new HTTPException(400, {
      message: "Either storeIds or stops must be provided",
    });
  }

  // Dedup: same warehouse + same ordered stores + same plannedStartAt → skip
  if (storeIds?.length) {
    const existing = await deliveries.findOne({
      departureWarehouseId,
      plannedStartAt,
      storeIds: { $eq: storeIds },
    });
    if (existing) {
      throw new HTTPException(409, {
        message:
          "An identical delivery (same warehouse, stores and departure time) already exists",
      });
    }
  }

  const delivery: Delivery = {
    _id: new ObjectId(),
    departureWarehouseId,
    storeIds: storeIds ?? [],
    totalDistanceKm,
    totalDurationSeconds,
    plannedStartAt,
    storeArrivals: [],
    status: "planned",
    ...(truckId ? { truckId } : {}),
    ...(driverId ? { driverId } : {}),
    ...(roadSignIds ? { roadSignIds } : {}),
    ...(wasRerouted !== undefined ? { wasRerouted } : {}),
    ...(stops?.length ? { stops } : {}),
  };

  await deliveries.insertOne(delivery);
  return delivery;
}
