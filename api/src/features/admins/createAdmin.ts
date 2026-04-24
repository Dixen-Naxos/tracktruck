import { ObjectId } from "mongodb";
import { firebaseAuth } from "../../auth/firebase.js";
import { users, type AdminUser } from "../../db/User.js";

export type CreateAdminInput = {
  email: string;
  password: string;
};

export async function createAdmin(
  input: CreateAdminInput,
): Promise<AdminUser> {
  const firebaseUser = await firebaseAuth.createUser({
    email: input.email,
    password: input.password,
  });

  const admin: AdminUser = {
    _id: new ObjectId(),
    firebaseUid: firebaseUser.uid,
    email: input.email,
    role: "admin",
  };

  try {
    await users.insertOne(admin);
  } catch (err) {
    await firebaseAuth.deleteUser(firebaseUser.uid).catch(() => {});
    throw err;
  }

  return admin;
}
