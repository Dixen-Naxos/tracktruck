import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { deliveries, type Delivery } from "../../db/Delivery.js";

export type CreateDeliveryInput = {
  departureWarehouseId: ObjectId;
  plannedStartAt: Date;
  storeIds: ObjectId[];
  totalDistanceKm: number;
  totalDurationSeconds: number;
  roadSignIds: string[];
  wasRerouted: boolean;
};

export async function createDelivery(
  input: CreateDeliveryInput,
): Promise<Delivery> {
  const {
    departureWarehouseId,
    plannedStartAt,
    storeIds,
    totalDistanceKm,
    totalDurationSeconds,
    roadSignIds,
    wasRerouted,
  } = input;

  // Dedup: same warehouse + same ordered stores + same plannedStartAt → skip
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

  const delivery: Delivery = {
    _id: new ObjectId(),
    departureWarehouseId,
    storeIds,
    totalDistanceKm,
    totalDurationSeconds,
    plannedStartAt,
    storeArrivals: [],
    status: "planned",
    roadSignIds,
    wasRerouted,
  };

  await deliveries.insertOne(delivery);
  return delivery;
}
