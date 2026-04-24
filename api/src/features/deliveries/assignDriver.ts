import { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { deliveries } from "../../db/Delivery.js";
import { users } from "../../db/User.js";

/**
 * Assigns (or reassigns) a driver to a delivery.
 * Pass `driverId: null` to unassign.
 */
export async function assignDriverToDelivery(
  deliveryId: ObjectId,
  driverId: ObjectId | null,
) {
  if (driverId) {
    const driver = await users.findOne({ _id: driverId });
    if (!driver) {
      throw new HTTPException(404, { message: "Driver not found" });
    }
    if (driver.role !== "driver") {
      throw new HTTPException(400, {
        message: "Target user is not a driver",
      });
    }
  }

  const result = await deliveries.findOneAndUpdate(
    { _id: deliveryId },
    driverId
      ? { $set: { driverId } }
      : { $unset: { driverId: "" } },
    { returnDocument: "after" },
  );

  if (!result) {
    throw new HTTPException(404, { message: "Delivery not found" });
  }
  return result;
}
