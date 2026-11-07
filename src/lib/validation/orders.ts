import { objectIdSchema } from "@/lib/validation/catalog";
import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/types/orders";

const trimmed = (label: string, min: number, max: number) =>
  z.string().trim().min(min, `Enter ${label}`).max(max, `${label} is too long`);

export const orderAddressSchema = z.object({
  name: trimmed("your full name", 2, 80),
  email: z.string().trim().toLowerCase().min(1, "Enter your email address").pipe(z.email("Enter a valid email address")),
  phone: z.string().trim().regex(/^[+0-9 ()-]{10,15}$/, "Enter a valid mobile number"),
  pin: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit PIN code"),
  state: trimmed("your state", 1, 60),
  city: trimmed("your city", 1, 60),
  address: trimmed("your delivery address", 5, 300),
  apartment: z.string().trim().max(100, "Apartment / house name is too long"),
});

export const createOrderSchema = z.object({
  shipping: orderAddressSchema,
  postOffice: z.string().trim().min(1).max(300),
  billingAddress: z.string().trim().min(5, "Enter the billing address").max(500, "Billing address is too long").nullable(),
  buyNow: z.object({
    productId: objectIdSchema,
    size: z.string().trim().min(1).max(20),
  }).optional(),
});

export const verifyPaymentSchema = z.object({
  accessToken: z.string().min(20).max(100),
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(200),
});

export const orderLookupSchema = z.object({
  orderNumber: z.string().trim().min(4).max(30),
  email: z.preprocess(
    (value) => typeof value === "string" && value.trim() === "" ? undefined : value,
    z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).optional(),
  ),
});

export const orderCancellationSchema = z.union([
  z.object({ accessToken: z.string().min(20).max(100) }),
  z.object({ orderId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid order") }),
]);

export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES.filter((status) => status !== "pending-payment") as ["confirmed", "packed", "shipped", "delivered", "cancelled"]),
  tracking: z
    .object({ carrier: z.string().trim().min(1, "Enter the carrier").max(60), awb: z.string().trim().min(1, "Enter the tracking number").max(60) })
    .nullable(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).default(""),
  status: z.union([z.enum(ORDER_STATUSES), z.literal("all")]).default("all"),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type OrderLookupInput = z.infer<typeof orderLookupSchema>;
export type OrderCancellationInput = z.infer<typeof orderCancellationSchema>;
export type OrderUpdateInput = z.infer<typeof orderUpdateSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
