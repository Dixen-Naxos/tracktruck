import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { deliveries } from "../../db/Delivery.js";
import { trucks } from "../../db/Truck.js";

export type FuelConsumptionResult = {
  deliveryId: string;
  truckId: string;
  plateNumber: string;
  fuelType: string;
  distanceKm: number;
  fuelConsumptionL100km: number;
  totalConsumptionL: number;
};

export async function getDeliveryFuelConsumption(
  deliveryId: ObjectId,
): Promise<FuelConsumptionResult> {
  const delivery = await deliveries.findOne({ _id: deliveryId });
  if (!delivery)
    throw new HTTPException(404, { message: "Delivery not found" });
  if (!delivery.truckId)
    throw new HTTPException(422, {
      message: "No truck assigned to this delivery",
    });

  const truck = await trucks.findOne({ _id: delivery.truckId });
  if (!truck) throw new HTTPException(404, { message: "Truck not found" });

  const totalConsumptionL =
    (truck.fuelConsumptionL100km / 100) * delivery.totalDistanceKm;

  return {
    deliveryId: delivery._id.toHexString(),
    truckId: truck._id.toHexString(),
    plateNumber: truck.plateNumber,
    fuelType: truck.fuelType,
    distanceKm: delivery.totalDistanceKm,
    fuelConsumptionL100km: truck.fuelConsumptionL100km,
    totalConsumptionL: Math.round(totalConsumptionL * 100) / 100,
  };
}
