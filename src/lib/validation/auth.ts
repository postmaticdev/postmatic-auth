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

export const registerFormSchema = z.object({
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
})

export const resendVerificationSchema = z.object({
  email: z.email("Format email tidak valid."),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type ResendVerificationValues = z.infer<typeof resendVerificationSchema>
