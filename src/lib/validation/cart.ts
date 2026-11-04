import { z } from "zod";
import { MAX_CART_LINE_QUANTITY } from "@/lib/cart-constants";
import { objectIdSchema } from "@/lib/validation/catalog";

const cartLineKeySchema = z.object({
  productId: objectIdSchema,
  size: z.string().trim().min(1).max(20),
});

export const addCartItemSchema = cartLineKeySchema;

export const updateCartItemSchema = cartLineKeySchema.extend({
  quantity: z.number().int().min(1).max(MAX_CART_LINE_QUANTITY),
});

export const removeCartItemSchema = cartLineKeySchema;

export type CartLineKey = z.infer<typeof cartLineKeySchema>;
