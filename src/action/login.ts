"use server"

import { redirect } from "next/navigation"

import { callAuthApi } from "./auth-client"
import { setAuthCookies } from "./cookies"
import { humanizeResponseMessage, sanitizeFromUrl } from "./helpers"
import { verifyTurnstileToken } from "./turnstile"
import type { ActionState, AuthLoginPayload } from "./types"

const loginResponseMessageMap: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid Credentials. Please check your email and password.",
  // Sama dengan INVALID_CREDENTIALS agar tidak membocorkan email terdaftar.
  EMAIL_NOT_FOUND: "Invalid Credentials. Please check your email and password.",
  EMAIL_NOT_VERIFIED: "Email not verified. Please check your inbox or resend the verification email.",
  PLEASE_WAIT: "A verification email was just sent. Please wait before requesting another.",
}

const extractRetryAfter = (payload: AuthLoginPayload | null | undefined): number | undefined => {
  if (!payload || typeof payload.retryAfter !== "number") {
    return undefined
  }

  return payload.retryAfter
}

const getLoginErrorMessage = (responseMessage?: string): string => {
  if (!responseMessage) {
    return "Login failed. Please try again."
  }

  return loginResponseMessageMap[responseMessage] ?? humanizeResponseMessage(responseMessage)
}

export const loginAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const email = String(formData.get("email") ?? "").trim()
  const password = String(formData.get("password") ?? "").trim()
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const turnstileToken = String(formData.get("turnstileToken") ?? "").trim()

  if (!email || !password) {
    return {
      status: "error",
      message: "Email and password are required.",
      code: "INVALID_INPUT",
    }
  }

  const turnstile = await verifyTurnstileToken(turnstileToken)

  if (!turnstile.ok) {
    return {
      status: "error",
      message: "Turnstile verification failed. Please try again.",
      code: turnstile.reason,
    }
  }

  const { ok, payload } = await callAuthApi<AuthLoginPayload>({
    method: "POST",
    path: "/api/account/auth/login",
    body: {
      from,
      email,
      password,
    },
  })

  if (!ok || !payload?.data?.accessToken || !payload?.data?.refreshToken) {
    return {
      status: "error",
      message: getLoginErrorMessage(payload?.responseMessage),
      code: payload?.responseMessage,
      retryAfter: extractRetryAfter(payload?.data ?? null),
    }
  }

  await setAuthCookies({
    accessToken: payload.data.accessToken,
    refreshToken: payload.data.refreshToken,
  })

  redirect(from)
}
