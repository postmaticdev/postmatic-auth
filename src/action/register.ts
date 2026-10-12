"use server"

import { redirect } from "next/navigation"

import { callAuthApi } from "./auth-client"
import {
  getNewPasswordError,
  humanizeResponseMessage,
  sanitizeFromUrl,
} from "./helpers"
import { verifyTurnstileToken } from "./turnstile"
import type { ActionState, AuthRegisterPayload } from "./types"

const registerResponseMessageMap: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "Email already exists. Please use another email.",
  PLEASE_WAIT: "A verification email has already been sent. Please wait before requesting another.",
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
  // Password tidak di-trim: disimpan persis seperti yang diketik.
  const password = String(formData.get("password") ?? "")
  const termsAccepted = String(formData.get("terms") ?? "") === "true"
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const turnstileToken = String(formData.get("turnstileToken") ?? "").trim()

  if (!name || !email || !password) {
    return {
      status: "error",
      message: "Name, email, and password are required.",
      code: "INVALID_INPUT",
    }
  }

  if (!termsAccepted) {
    return {
      status: "error",
      message: "You must agree to the Terms and Conditions.",
      code: "TERMS_NOT_ACCEPTED",
    }
  }

  const passwordError = getNewPasswordError(password)
  if (passwordError) {
    return {
      status: "error",
      message: passwordError,
      code: "INVALID_PASSWORD",
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
