import { z } from "zod";
import { TICKET_STATUSES, TICKET_TOPICS } from "@/lib/types/account";
import { objectIdSchema } from "@/lib/validation/catalog";
import { isWeakPassword } from "@/lib/validation/password";
import { orderAddressSchema } from "@/lib/validation/orders";

export const MAX_SAVED_ADDRESSES = 5;
export const MAX_TICKET_MESSAGES = 200;

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  phone: z.union([z.literal(""), z.string().trim().regex(/^[+0-9 ()-]{10,15}$/, "Enter a valid mobile number")]),
});

export const addressSchema = orderAddressSchema;

export const newPasswordSchema = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Password is too long")
  .refine((password) => !isWeakPassword(password), "That password is too easy to guess. Avoid sequences, repeated characters and common words.");

// Accounts created with Google have no password yet, so the current password is optional here and enforced by the service.
export const changePasswordSchema = z.object({
  currentPassword: z.string().max(128).optional().default(""),
  newPassword: newPasswordSchema,
});

export const favoriteSchema = z.object({ productId: objectIdSchema });

const messageBody = z.string().trim().min(1, "Write a message").max(2000, "Messages can be up to 2000 characters");

export const ticketCreateSchema = z.object({
  topic: z.enum(TICKET_TOPICS),
  orderRef: z.string().trim().max(30).nullable().default(null),
  message: messageBody,
});

export const ticketMessageSchema = z.object({ body: messageBody });
export const ticketStatusSchema = z.object({ status: z.enum(["open", "closed"]) });

export const ticketListQuerySchema = z.object({
  q: z.string().trim().max(100).default(""),
  status: z.union([z.enum(TICKET_STATUSES), z.literal("all")]).default("all"),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type TicketCreateInput = z.infer<typeof ticketCreateSchema>;
export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;
