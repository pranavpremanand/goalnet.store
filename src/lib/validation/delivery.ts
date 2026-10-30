import { z } from "zod";

export const pincodeSchema = z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode.");
