import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { firebaseAuth } from "../../auth/firebase.js";
import { users, type DriverUser } from "../../db/User.js";

export type UpdateDriverInput = {
  firstName?: string;
  lastName?: string;
};

export async function updateDriver(
  id: ObjectId,
  input: UpdateDriverInput,
): Promise<DriverUser> {
  const driver = await users.findOneAndUpdate(
    { _id: id, role: "driver" },
    { $set: input },
    { returnDocument: "after" },
  );
  if (!driver || driver.role !== "driver") {
    throw new HTTPException(404, { message: "Driver not found" });
  }

  await firebaseAuth.updateUser(driver.firebaseUid, {
    displayName: `${driver.firstName} ${driver.lastName}`,
  });

  return driver;
}
