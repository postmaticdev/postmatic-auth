// zod/mini: API fungsional dari core yang sama dengan zod klasik (pesan error
// dan urutan check identik), tetapi bisa di-tree-shake sehingga bundle client
// tidak ikut membawa seluruh library zod.
import * as z from "zod/mini"

const asciiPasswordRegex = /^[\x20-\x7E]+$/

export const NEW_PASSWORD_MIN_LENGTH = 8
export const NEW_PASSWORD_HINT =
  "Use 8-72 characters: letters, numbers, or standard symbols, with no leading or trailing spaces."

const emailSchema = z.string().check(z.email("Invalid email format."))

// Aturan password baru (register & reset) - sama dengan validasi di server
// action dan API: ASCII printable, 8-72 karakter (batas bcrypt), tanpa spasi
// di awal atau akhir.
const newPasswordSchema = z.string().check(
  z.minLength(NEW_PASSWORD_MIN_LENGTH, "Password must be at least 8 characters."),
  z.maxLength(72, "Password must be at most 72 characters."),
  z.regex(asciiPasswordRegex, "Password contains invalid characters."),
  z.refine((value: string) => value === value.trim(), {
    message: "Password cannot start or end with a space.",
  })
)

// Login tidak memakai batas minimal password baru: akun lama boleh punya
// password yang lebih pendek dari 8 karakter.
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().check(
    z.minLength(1, "Password is required."),
    z.regex(asciiPasswordRegex, "Password contains invalid characters.")
  ),
})

export const registerFormSchema = z
  .object({
    name: z.string().check(
      z.trim(),
      z.minLength(3, "Name must be at least 3 characters."),
      z.maxLength(80, "Name must be at most 80 characters.")
    ),
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string().check(z.minLength(1, "Please confirm your password.")),
  })
  .check(
    z.refine(
      (value: { password: string; confirmPassword: string }) =>
        value.password === value.confirmPassword,
      {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      }
    )
  )

export const resendVerificationSchema = z.object({
  email: emailSchema,
})

export const forgotPasswordRequestSchema = z.object({
  email: emailSchema,
})

export const forgotPasswordResetSchema = z
  .object({
    email: emailSchema,
    newPassword: newPasswordSchema,
    confirmPassword: z.string().check(z.minLength(1, "Please confirm your password.")),
  })
  .check(
    z.refine(
      (value: { newPassword: string; confirmPassword: string }) =>
        value.newPassword === value.confirmPassword,
      {
        message: "Passwords do not match.",
        path: ["confirmPassword"],
      }
    )
  )

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type ResendVerificationValues = z.infer<typeof resendVerificationSchema>
export type ForgotPasswordRequestValues = z.infer<typeof forgotPasswordRequestSchema>
export type ForgotPasswordResetValues = z.infer<typeof forgotPasswordResetSchema>
