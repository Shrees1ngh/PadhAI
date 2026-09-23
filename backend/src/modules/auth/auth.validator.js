import { z } from "zod";

export const registerInputSchema = z.object({
  name: z
    .string({ error: "Name is required" })
    .min(2, "Name must be at least 2 characters long")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  email: z
    .string({ error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: "Password is required" })
    .min(8, "Password must be at least 8 characters long"),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

export const loginInputSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  password: z
    .string({ error: "Password is required" })
    .min(1, "Password is required"),
});

export const exchangeCodeInputSchema = z.object({
  code: z.string({ error: "Exchange code is required" }).min(1, "Code is required"),
});

