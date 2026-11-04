import { z } from "zod";

export const pincodeSchema = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode.");

export const deliveryQuoteSchema = z.object({
  pincode: pincodeSchema,
  quantity: z.number().int().min(1).max(200),
});
