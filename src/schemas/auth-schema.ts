import { z } from "zod";

type Translator = (key: string, values?: Record<string, string | number>) => string;

export function signInSchema(t: Translator) {
  return z.object({
    email: z.string().min(1, t("required")).email(t("invalidEmail")),
    password: z.string().min(1, t("required")),
  });
}

export function signUpSchema(t: Translator) {
  return z.object({
    name: z.string().min(1, t("required")),
    email: z.string().min(1, t("required")).email(t("invalidEmail")),
    password: z.string().min(8, t("minLength", { min: 8 })),
  });
}

export function forgotPasswordSchema(t: Translator) {
  return z.object({
    email: z.string().min(1, t("required")).email(t("invalidEmail")),
  });
}

export function resetPasswordSchema(t: Translator) {
  return z
    .object({
      password: z.string().min(8, t("minLength", { min: 8 })),
      confirmPassword: z.string().min(1, t("required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordMismatch"),
      path: ["confirmPassword"],
    });
}

export type SignInInput = z.infer<ReturnType<typeof signInSchema>>;
export type SignUpInput = z.infer<ReturnType<typeof signUpSchema>>;
export type ForgotPasswordInput = z.infer<ReturnType<typeof forgotPasswordSchema>>;
export type ResetPasswordInput = z.infer<ReturnType<typeof resetPasswordSchema>>;
