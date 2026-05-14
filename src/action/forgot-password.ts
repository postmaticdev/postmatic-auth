"use server"

import { redirect } from "next/navigation"

import { verifyTurnstileToken } from "./turnstile"
import type { ActionState } from "./types"

const USE_MOCK_FORGOT_PASSWORD = true

type ForgotPasswordTokenStatusResult = {
  valid: boolean
  message: string
  code?: string
  email?: string
}

const passwordRegex = /^[A-Za-z0-9]{6,}$/

const getMockEmailFromToken = (token: string): string => {
  if (token === "testing") {
    return "testing.user@postmatic.id"
  }

  if (token.startsWith("testing:")) {
    return token.slice("testing:".length)
  }

  return ""
}

export const getForgotPasswordTokenStatus = async (
  token: string
): Promise<ForgotPasswordTokenStatusResult> => {
  if (!token) {
    return {
      valid: false,
      code: "INVALID_RESET_PASSWORD_TOKEN",
      message: "Link reset password tidak ditemukan.",
    }
  }

  if (USE_MOCK_FORGOT_PASSWORD) {
    const mockEmail = getMockEmailFromToken(token)

    if (mockEmail) {
      return {
        valid: true,
        code: "CHECK_RESET_PASSWORD_TOKEN_SUCCESS",
        message: "Link reset password valid.",
        email: mockEmail,
      }
    }

    return {
      valid: false,
      code: "INVALID_RESET_PASSWORD_TOKEN",
      message: "Link reset password tidak valid atau sudah kedaluwarsa.",
    }
  }

  // TODO: Replace mock with real API call once endpoint is available.
  return {
    valid: false,
    code: "RESET_PASSWORD_API_NOT_IMPLEMENTED",
    message: "Endpoint reset password belum tersedia.",
  }
}

export const requestForgotPasswordAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const turnstileToken = String(formData.get("turnstileToken") ?? "").trim()

  if (!email) {
    return {
      status: "error",
      code: "INVALID_INPUT",
      message: "Email wajib diisi.",
    }
  }

  const turnstile = await verifyTurnstileToken(turnstileToken)

  if (!turnstile.ok) {
    return {
      status: "error",
      code: turnstile.reason,
      message: "Verifikasi Turnstile gagal. Silakan coba ulang.",
    }
  }

  if (USE_MOCK_FORGOT_PASSWORD) {
    if (email.includes("wait")) {
      return {
        status: "error",
        code: "PLEASE_WAIT",
        message: "Email reset baru saja dikirim. Tunggu sebelum mengirim ulang.",
        retryAfter: 60,
      }
    }

    return {
      status: "success",
      code: "RESET_PASSWORD_EMAIL_SENT",
      message: "Kami telah mengirim link reset password ke email Anda.",
    }
  }

  // TODO: Replace mock with real API call once endpoint is available.
  return {
    status: "error",
    code: "RESET_PASSWORD_API_NOT_IMPLEMENTED",
    message: "Endpoint forgot-password belum tersedia.",
  }
}

export const submitForgotPasswordResetAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const token = String(formData.get("token") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  const newPassword = String(formData.get("newPassword") ?? "")
  const confirmPassword = String(formData.get("confirmPassword") ?? "")
  const turnstileToken = String(formData.get("turnstileToken") ?? "").trim()

  if (!token || !email || !newPassword || !confirmPassword) {
    return {
      status: "error",
      code: "INVALID_INPUT",
      message: "Data reset password belum lengkap.",
    }
  }

  if (newPassword !== confirmPassword) {
    return {
      status: "error",
      code: "PASSWORD_NOT_MATCH",
      message: "Password dan konfirmasi password harus sama.",
    }
  }

  if (!passwordRegex.test(newPassword)) {
    return {
      status: "error",
      code: "INVALID_PASSWORD",
      message: "Password harus alphanumeric dengan minimal 6 karakter.",
    }
  }

  const turnstile = await verifyTurnstileToken(turnstileToken)

  if (!turnstile.ok) {
    return {
      status: "error",
      code: turnstile.reason,
      message: "Verifikasi Turnstile gagal. Silakan coba ulang.",
    }
  }

  if (USE_MOCK_FORGOT_PASSWORD) {
    if (!getMockEmailFromToken(token)) {
      return {
        status: "error",
        code: "INVALID_RESET_PASSWORD_TOKEN",
        message: "Link reset password tidak valid atau sudah kedaluwarsa.",
      }
    }

    redirect(`/login?reset=1&email=${encodeURIComponent(email)}`)
  }

  // TODO: Replace mock with real API call once endpoint is available.
  return {
    status: "error",
    code: "RESET_PASSWORD_API_NOT_IMPLEMENTED",
    message: "Endpoint reset password belum tersedia.",
  }
}
