import type { ObjectId } from "mongodb";
import { HTTPException } from "hono/http-exception";
import { firebaseAuth } from "../../auth/firebase.js";
import { users } from "../../db/User.js";

export async function deleteDriver(id: ObjectId): Promise<void> {
  const driver = await users.findOneAndDelete({ _id: id, role: "driver" });
  if (!driver) {
    throw new HTTPException(404, { message: "Driver not found" });
  }
  await firebaseAuth.deleteUser(driver.firebaseUid).catch(() => {});
}
