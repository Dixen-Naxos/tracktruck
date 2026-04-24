import { ObjectId } from "mongodb";
import { firebaseAuth } from "../../auth/firebase.js";
import { users, type DriverUser } from "../../db/User.js";

export type CreateDriverInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  skills: string[];
  zones: string[];
};

export async function createDriver(
  input: CreateDriverInput,
): Promise<DriverUser> {
  const firebaseUser = await firebaseAuth.createUser({
    email: input.email,
    displayName: `${input.firstName} ${input.lastName}`,
  });

  const driver: DriverUser = {
    _id: new ObjectId(),
    firebaseUid: firebaseUser.uid,
    email: input.email,
    role: "driver",
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    skills: input.skills,
    zones: input.zones,
  };

  try {
    await users.insertOne(driver);
  } catch (err) {
    await firebaseAuth.deleteUser(firebaseUser.uid).catch(() => {});
    throw err;
  }

  return driver;
}
