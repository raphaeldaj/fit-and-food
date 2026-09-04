import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  phone: z.string().regex(/^(70|75|76|77|78)[0-9]{7}$/, "Numéro sénégalais invalide"),
  password: z
    .string()
    .min(10, "10 caractères minimum")
    .regex(/[A-Z]/, "Au moins une majuscule")
    .regex(/[0-9]/, "Au moins un chiffre")
    .regex(/[^A-Za-z0-9]/, "Au moins un caractère spécial"),
  gymId: z.string().optional(),
});

export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string() })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Mot de passe requis"),
});

export const twoFactorSchema = z.object({
  token: z.string().length(6, "Code à 6 chiffres"),
});