import { z } from "zod";

export const registerSchema = z.object({
  login: z.string().min(3, "Login min 3 znaki").max(32),
  password: z.string().min(8, "Hasło min 8 znaków").max(128),
});

export const loginSchema = z.object({
  login: z.string().min(1),
  password: z.string().min(1),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(60),
  type: z.string().min(2).max(40).default("General"),
  description: z.string().max(500).default(""),
  color: z.string().min(4).max(20).default("#3b5bfd"),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  priceCents: z.number().int().nonnegative(),
  description: z.string().max(1000).default(""),
  categoryId: z.number().int().positive().nullable().optional(),
  stock: z.number().int().nonnegative().default(0),
  imageUrl: z.string().max(500).default(""),
});
