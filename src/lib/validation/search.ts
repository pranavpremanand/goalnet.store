import { z } from "zod";

export const productSearchSchema = z.object({
  q: z.string().trim().min(2, "Enter at least 2 characters to search").max(80, "Search is too long"),
  page: z.coerce.number().int().min(1).max(100_000).default(1),
});
