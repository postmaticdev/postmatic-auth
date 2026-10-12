"use server"

import { redirect } from "next/navigation"

import { callAuthApi } from "./auth-client"
import { getNewPasswordError, humanizeResponseMessage } from "./helpers"
import { verifyTurnstileToken } from "./turnstile"
import type {
  ActionState,
  ForgotPasswordRequestPayload,
  ForgotPasswordResetPayload,
  ForgotPasswordStatusPayload,
} from "./types"

type ForgotPasswordTokenStatusResult = {
  valid: boolean
  message: string
  code?: string
  email?: string
}

// Respons generik agar halaman ini tidak bisa dipakai mengecek email mana
// yang terdaftar (user enumeration).
const FORGOT_PASSWORD_SENT_MESSAGE =
  "Jika email terdaftar, kami telah mengirim link reset password ke email tersebut."

const forgotPasswordResponseMessageMap: Record<string, string> = {
  PLEASE_WAIT: "Email reset baru saja dikirim. Tunggu sebelum mengirim ulang.",
  INVALID_FORGOT_PASSWORD_TOKEN:
    "Link reset password tidak valid atau sudah kedaluwarsa.",
}

const getForgotPasswordMessage = (responseMessage?: string): string => {
  if (!responseMessage) {
    return "Terjadi kesalahan. Coba lagi."
  }

  return (
    forgotPasswordResponseMessageMap[responseMessage] ??
    humanizeResponseMessage(responseMessage)
  )
}

const extractRetryAfter = (
  payload:
    | ForgotPasswordRequestPayload
    | ForgotPasswordStatusPayload
    | ForgotPasswordResetPayload
    | null
    | undefined
): number | undefined => {
  if (!payload || typeof payload !== "object") {
    return undefined
  }

  if ("retryAfter" in payload && typeof payload.retryAfter === "number") {
    return payload.retryAfter
  }

  return undefined
}

export const getForgotPasswordTokenStatus = async (
  token: string
): Promise<ForgotPasswordTokenStatusResult> => {
  if (!token) {
    return {
      valid: false,
      code: "INVALID_FORGOT_PASSWORD_TOKEN",
      message: "Link reset password tidak ditemukan.",
    }
  }

  const encodedToken = encodeURIComponent(token)
  const { ok, payload } = await callAuthApi<ForgotPasswordStatusPayload>({
    method: "GET",
    path: `/api/account/auth/forgot-password/${encodedToken}`,
  })

  if (!ok || !payload?.data) {
    return {
      valid: false,
      code: payload?.responseMessage,
      message: getForgotPasswordMessage(payload?.responseMessage),
    }
  }

  return {
    valid: payload.data.valid,
    code: payload?.responseMessage,
    message: getForgotPasswordMessage(payload?.responseMessage),
    email: payload.data.email,
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

  const { ok, payload } = await callAuthApi<ForgotPasswordRequestPayload>({
    method: "POST",
    path: "/api/account/auth/forgot-password",
    body: {
      email,
    },
  })

  if (!ok && payload?.responseMessage !== "USER_NOT_FOUND") {
    return {
      status: "error",
      code: payload?.responseMessage,
      message: getForgotPasswordMessage(payload?.responseMessage),
      retryAfter: extractRetryAfter(payload?.data ?? null),
    }
  }

  return {
    status: "success",
    code: ok ? payload?.responseMessage : undefined,
    message: FORGOT_PASSWORD_SENT_MESSAGE,
    retryAfter: extractRetryAfter(payload?.data ?? null),
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

  const passwordError = getNewPasswordError(newPassword)
  if (passwordError) {
    return {
      status: "error",
      code: "INVALID_PASSWORD",
      message: passwordError,
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

  const encodedToken = encodeURIComponent(token)
  const { ok, payload } = await callAuthApi<ForgotPasswordResetPayload>({
    method: "POST",
    path: `/api/account/auth/forgot-password/${encodedToken}`,
    body: {
      newPassword,
    },
  })

  if (!ok || !payload?.data?.valid) {
    return {
      status: "error",
      code: payload?.responseMessage,
      message: getForgotPasswordMessage(payload?.responseMessage),
      retryAfter: extractRetryAfter(payload?.data ?? null),
    }
  }

  redirect(`/login?reset=1&email=${encodeURIComponent(email)}`)
}
