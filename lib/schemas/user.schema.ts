import { z } from "zod";

// ──────────────────────────────────────────
// Primitive schemas
// ──────────────────────────────────────────

export const emailSchema = z.email("Invalid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must be at most 100 characters");

// ──────────────────────────────────────────
// User schemas
// ──────────────────────────────────────────

export const userSchema = z.object({
  id: z.cuid(),
  name: z.string().min(1, "Name is required").max(100),
  email: emailSchema,
  image: z.url().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = createUserSchema.partial();

// ──────────────────────────────────────────
// Auth schemas
// ──────────────────────────────────────────

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ──────────────────────────────────────────
// Inferred types
// ──────────────────────────────────────────

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type SignIn = z.infer<typeof signInSchema>;
export type SignUp = z.infer<typeof signUpSchema>;
