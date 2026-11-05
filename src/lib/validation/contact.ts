import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(254, "Email is too long"),
  phone: z.string().trim().max(30, "Phone number is too long").default(""),
  message: z.string().trim().min(1, "Write a message").max(5000, "Message is too long"),
});

export const contactSubmissionListQuerySchema = z.object({
  cursor: z.string().regex(/^[a-f\d]{24}$/i, "Invalid cursor").optional(),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
