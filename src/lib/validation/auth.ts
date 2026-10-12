import { z } from "zod"

const asciiPasswordRegex = /^[\x20-\x7E]{6,}$/

// Aturan password baru (register & reset) - sama dengan validasi di server
// action: ASCII printable, 6-72 karakter (batas bcrypt), tanpa spasi di awal
// atau akhir.
const newPasswordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(72, "Password must be at most 72 characters.")
  .regex(asciiPasswordRegex, "Password contains invalid characters.")
  .refine((value) => value === value.trim(), {
    message: "Password cannot start or end with a space.",
  })

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters.")
    .regex(
      asciiPasswordRegex,
      "Password contains invalid characters."
    ),
})

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Name must be at least 3 characters.")
      .max(80, "Name must be at most 80 characters."),
    email: z.string().email("Invalid email format."),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format."),
})

export const forgotPasswordRequestSchema = z.object({
  email: z.string().email("Invalid email format."),
})

export const forgotPasswordResetSchema = z
  .object({
    email: z.string().email("Invalid email format."),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type ResendVerificationValues = z.infer<typeof resendVerificationSchema>
export type ForgotPasswordRequestValues = z.infer<typeof forgotPasswordRequestSchema>
export type ForgotPasswordResetValues = z.infer<typeof forgotPasswordResetSchema>
