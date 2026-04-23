import { ObjectId } from "mongodb";
import { z } from "zod";

export const zObjectId = z
  .string()
  .refine((s) => ObjectId.isValid(s), "Invalid ID")
  .transform((s) => new ObjectId(s));

export const idParamSchema = z.object({
  id: zObjectId,
});
