"use server"

import { redirect } from "next/navigation"

import { callAuthApi } from "./auth-client"
import { setAuthCookies } from "./cookies"
import {
  buildRedirectWithTokens,
  humanizeResponseMessage,
  sanitizeFromUrl,
} from "./helpers"
import { verifyTurnstileToken } from "./turnstile"
import type {
  ActionState,
  AuthRegisterPayload,
  AuthVerifyPayload,
  AuthVerifyStatusPayload,
} from "./types"

const verifyResponseMessageMap: Record<string, string> = {
  INVALID_CREATE_ACCOUNT_TOKEN: "Link verifikasi tidak valid atau sudah kedaluwarsa.",
  USER_ALREADY_VERIFIED: "Akun ini sudah terverifikasi. Silakan login.",
  CHECK_VERIFY_TOKEN_SUCCESS: "Link verifikasi valid.",
  SUBMIT_VERIFY_TOKEN_SUCCESS: "Akun berhasil diverifikasi.",
  USER_NOT_FOUND: "Akun tidak ditemukan.",
  PLEASE_WAIT: "Email verifikasi baru saja dikirim. Tunggu sebelum kirim ulang lagi.",
}

const extractEmailFromJwt = (token: string): string | undefined => {
  const chunks = token.split(".")

  if (chunks.length !== 3) {
    return undefined
  }

  try {
    const payload = JSON.parse(
      Buffer.from(chunks[1], "base64url").toString("utf8")
    ) as { email?: unknown }

    if (typeof payload.email === "string" && payload.email.length > 3) {
      return payload.email
    }

    return undefined
  } catch {
    return undefined
  }
}

const getVerifyMessage = (responseMessage?: string): string => {
  if (!responseMessage) {
    return "Terjadi kesalahan. Coba lagi."
  }

  return verifyResponseMessageMap[responseMessage] ?? humanizeResponseMessage(responseMessage)
}

const getRetryAfter = (payload: unknown): number | undefined => {
  if (
    typeof payload === "object" &&
    payload &&
    "retryAfter" in payload &&
    typeof (payload as { retryAfter?: unknown }).retryAfter === "number"
  ) {
    return (payload as { retryAfter: number }).retryAfter
  }

  return undefined
}

export type VerifyTokenStatusResult = {
  valid: boolean
  message: string
  code?: string
  email?: string
  data: AuthVerifyStatusPayload | null
}

export const getVerifyTokenStatus = async (
  token: string
): Promise<VerifyTokenStatusResult> => {
  const emailFromToken = extractEmailFromJwt(token)

  if (!token) {
    return {
      valid: false,
      message: "Link verifikasi tidak ditemukan.",
      code: "INVALID_CREATE_ACCOUNT_TOKEN",
      email: undefined,
      data: null,
    }
  }

  const { ok, payload } = await callAuthApi<AuthVerifyStatusPayload>({
    method: "GET",
    path: `/api/account/auth/verify/${token}`,
  })

  if (!ok || !payload?.data) {
    return {
      valid: false,
      message: getVerifyMessage(payload?.responseMessage),
      code: payload?.responseMessage,
      email: emailFromToken,
      data: null,
    }
  }

  return {
    valid: payload.data.valid,
    message: getVerifyMessage(payload.responseMessage),
    code: payload.responseMessage,
    email: payload.data.email || emailFromToken,
    data: payload.data,
  }
}

export const verifyAccountAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const token = String(formData.get("token") ?? "").trim()
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const email = String(formData.get("email") ?? "").trim() || extractEmailFromJwt(token) || ""
  const turnstileToken = String(formData.get("turnstileToken") ?? "").trim()

  if (!token) {
    return {
      status: "error",
      message: "Link verifikasi tidak ditemukan.",
      code: "INVALID_CREATE_ACCOUNT_TOKEN",
    }
  }

  const turnstile = await verifyTurnstileToken(turnstileToken)

  if (!turnstile.ok) {
    return {
      status: "error",
      message: "Verifikasi Turnstile gagal. Silakan coba ulang.",
      code: turnstile.reason,
    }
  }

  const { ok, payload } = await callAuthApi<AuthVerifyPayload>({
    method: "POST",
    path: `/api/account/auth/verify/${token}?from=${encodeURIComponent(from)}`,
  })

  if (!ok || !payload?.data?.accessToken || !payload?.data?.refreshToken) {
    if (payload?.responseMessage === "USER_ALREADY_VERIFIED") {
      redirect(
        `/login?verified=1&email=${encodeURIComponent(email)}&from=${encodeURIComponent(from)}`
      )
    }

    return {
      status: "error",
      message: getVerifyMessage(payload?.responseMessage),
      code: payload?.responseMessage,
      retryAfter: getRetryAfter(payload?.data),
    }
  }

  await setAuthCookies({
    accessToken: payload.data.accessToken,
    refreshToken: payload.data.refreshToken,
  })

  redirect(
    buildRedirectWithTokens(
      from,
      payload.data.accessToken,
      payload.data.refreshToken
    )
  )
}

export const resendVerificationEmailAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const email = String(formData.get("email") ?? "").trim()
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const turnstileToken = String(formData.get("turnstileToken") ?? "").trim()

  if (!email) {
    return {
      status: "error",
      message: "Email wajib diisi.",
      code: "INVALID_INPUT",
    }
  }

  const turnstile = await verifyTurnstileToken(turnstileToken)

  if (!turnstile.ok) {
    return {
      status: "error",
      message: "Verifikasi Turnstile gagal. Silakan coba ulang.",
      code: turnstile.reason,
    }
  }

  const { ok, payload } = await callAuthApi<AuthRegisterPayload>({
    method: "POST",
    path: "/api/account/auth/resend-email-verification",
    body: {
      email,
      from,
    },
  })

  if (!ok) {
    return {
      status: "error",
      message: getVerifyMessage(payload?.responseMessage),
      code: payload?.responseMessage,
      retryAfter: getRetryAfter(payload?.data),
    }
  }

  return {
    status: "success",
    message: "Email verifikasi berhasil dikirim ulang.",
    code: payload?.responseMessage,
    retryAfter: getRetryAfter(payload?.data),
  }
}
