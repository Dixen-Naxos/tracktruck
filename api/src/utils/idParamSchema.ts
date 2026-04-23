import { ObjectId } from "mongodb";
import { z } from "zod";

export const idParamSchema = z.object({
  id: z
    .string()
    .refine((s) => ObjectId.isValid(s), "Invalid ID")
    .transform((s) => new ObjectId(s)),
});
