"use server"

import { redirect } from "next/navigation"

import { callAuthApi } from "./auth-client"
import {
  getNewPasswordError,
  hasValidationError,
  humanizeResponseMessage,
  sanitizeFromUrl,
} from "./helpers"
import { verifyTurnstileToken } from "./turnstile"
import type { ActionState, AuthApiEnvelope, AuthRegisterPayload } from "./types"

const registerResponseMessageMap: Record<string, string> = {
  EMAIL_ALREADY_EXISTS: "Email already exists. Please use another email.",
  PLEASE_WAIT: "A verification email has already been sent. Please wait before requesting another.",
  ACCOUNT_USES_GOOGLE_SIGN_IN:
    "This email is already registered with Google. Sign in with Google, or set a password via Forgot password.",
  TOO_MANY_REQUESTS: "Too many sign-up attempts. Please wait before trying again.",
}

const PASSWORD_TOO_SHORT_MESSAGE =
  "Password must be 8-72 characters and use only letters, numbers, or standard symbols."

const extractRetryAfter = (
  payload: AuthRegisterPayload | null | undefined
): number | undefined => {
  if (!payload || typeof payload.retryAfter !== "number") {
    return undefined
  }

  return payload.retryAfter
}

const getRegisterErrorMessage = (
  payload: AuthApiEnvelope<AuthRegisterPayload> | null
): string => {
  const responseMessage = payload?.responseMessage

  if (!responseMessage) {
    return "Registration failed. Please try again."
  }

  if (
    responseMessage === "VALIDATION_FAILED" &&
    hasValidationError(payload?.validationErrors, "password")
  ) {
    return PASSWORD_TOO_SHORT_MESSAGE
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

  const { ok, payload, retryAfter } = await callAuthApi<AuthRegisterPayload>({
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
      message: getRegisterErrorMessage(payload),
      code: payload?.responseMessage,
      retryAfter: extractRetryAfter(payload?.data ?? null) ?? retryAfter,
    }
  }

  redirect(
    `/login?registered=1&email=${encodeURIComponent(email)}&from=${encodeURIComponent(from)}`
  )
}
