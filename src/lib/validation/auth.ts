import { z } from "zod"

const asciiPasswordRegex = /^[\x20-\x7E]+$/

export const NEW_PASSWORD_MIN_LENGTH = 8
export const NEW_PASSWORD_HINT =
  "Use 8-72 characters: letters, numbers, or standard symbols, with no leading or trailing spaces."

// Aturan password baru (register & reset) - sama dengan validasi di server
// action dan API: ASCII printable, 8-72 karakter (batas bcrypt), tanpa spasi
// di awal atau akhir.
const newPasswordSchema = z
  .string()
  .min(NEW_PASSWORD_MIN_LENGTH, "Password must be at least 8 characters.")
  .max(72, "Password must be at most 72 characters.")
  .regex(asciiPasswordRegex, "Password contains invalid characters.")
  .refine((value) => value === value.trim(), {
    message: "Password cannot start or end with a space.",
  })

// Login tidak memakai batas minimal password baru: akun lama boleh punya
// password yang lebih pendek dari 8 karakter.
export const loginFormSchema = z.object({
  email: z.string().email("Invalid email format."),
  password: z
    .string()
    .min(1, "Password is required.")
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
