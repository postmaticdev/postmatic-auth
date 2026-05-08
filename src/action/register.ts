"use server"

import { redirect } from "next/navigation"

import { callAuthApi } from "./auth-client"
import { humanizeResponseMessage, sanitizeFromUrl } from "./helpers"
import { verifyTurnstileToken } from "./turnstile"
import type { ActionState, AuthRegisterPayload } from "./types"

const registerResponseMessageMap: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "Email already exists. Please use another email.",
  PLEASE_WAIT: "Email verifikasi sudah dikirim. Tunggu sebelum meminta kirim ulang.",
}

const extractRetryAfter = (
  payload: AuthRegisterPayload | null | undefined
): number | undefined => {
  if (!payload || typeof payload.retryAfter !== "number") {
    return undefined
  }

  return payload.retryAfter
}

const getRegisterErrorMessage = (responseMessage?: string): string => {
  if (!responseMessage) {
    return "Registration failed. Please try again."
  }

  return registerResponseMessageMap[responseMessage] ?? humanizeResponseMessage(responseMessage)
}

export const registerAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const name = String(formData.get("name") ?? "").trim()
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "").trim()
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const turnstileToken = String(formData.get("turnstileToken") ?? "").trim()

  if (!name || !email || !password) {
    return {
      status: "error",
      message: "Nama, email, dan password wajib diisi.",
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
    path: "/api/account/auth/register",
    body: {
      from,
      name,
      email,
      password,
    },
  })

  if (!ok || !payload?.data) {
    return {
      status: "error",
      message: getRegisterErrorMessage(payload?.responseMessage),
      code: payload?.responseMessage,
      retryAfter: extractRetryAfter(payload?.data ?? null),
    }
  }

  redirect(
    `/login?registered=1&email=${encodeURIComponent(email)}&from=${encodeURIComponent(from)}`
  )
}
