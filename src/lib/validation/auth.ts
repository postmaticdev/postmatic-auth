import { z } from "zod"

const asciiAlphanumericPasswordRegex = /^[A-Za-z0-9]{6,}$/

export const loginFormSchema = z.object({
  email: z.email("Format email tidak valid."),
  password: z
    .string()
    .min(6, "Password minimal 6 karakter.")
    .regex(
      asciiAlphanumericPasswordRegex,
      "Password harus alphanumeric (A-Z, a-z, 0-9) tanpa karakter non-ASCII."
    ),
})

export const registerFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nama minimal 3 karakter.")
      .max(80, "Nama maksimal 80 karakter."),
    email: z.email("Format email tidak valid."),
    password: z
      .string()
      .min(6, "Password minimal 6 karakter.")
      .regex(
        asciiAlphanumericPasswordRegex,
        "Password harus alphanumeric (A-Z, a-z, 0-9) tanpa karakter non-ASCII."
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Password dan konfirmasi password harus sama.",
    path: ["confirmPassword"],
  })

export const resendVerificationSchema = z.object({
  email: z.email("Format email tidak valid."),
})

export const forgotPasswordRequestSchema = z.object({
  email: z.email("Format email tidak valid."),
})

export const forgotPasswordResetSchema = z
  .object({
    email: z.email("Format email tidak valid."),
    newPassword: z
      .string()
      .min(6, "Password minimal 6 karakter.")
      .regex(
        asciiAlphanumericPasswordRegex,
        "Password harus alphanumeric (A-Z, a-z, 0-9) tanpa karakter non-ASCII."
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi."),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Password dan konfirmasi password harus sama.",
    path: ["confirmPassword"],
  })

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type ResendVerificationValues = z.infer<typeof resendVerificationSchema>
export type ForgotPasswordRequestValues = z.infer<typeof forgotPasswordRequestSchema>
export type ForgotPasswordResetValues = z.infer<typeof forgotPasswordResetSchema>
