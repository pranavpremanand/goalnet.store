import { z } from "zod";

const productIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID.");

export const wishlistProductSchema = z.object({
  productId: productIdSchema,
});

export const mergeWishlistSchema = z.object({
  productIds: z.array(productIdSchema).max(500, "You can sync up to 500 saved products at a time."),
});
