import { z } from "zod";
import { isWeakPassword } from "@/lib/validation/password";

// Shared by the browser forms and the API so both enforce the same rules.

const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address")
  .pipe(z.email("Enter a valid email address"));

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password").max(128, "Password is too long"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "Name is too long"),
  email: emailField,
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .max(128, "Password is too long")
    .refine((password) => !isWeakPassword(password), "That password is too easy to guess. Avoid sequences, repeated characters and common words."),
  acceptTerms: z.boolean().refine((accepted) => accepted, "Please accept the terms and privacy policy"),
});

export const forgotPasswordSchema = z.object({ email: emailField });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
