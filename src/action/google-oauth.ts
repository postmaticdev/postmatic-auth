"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { env } from "@/constants"

import { callAuthApi } from "./auth-client"
import { humanizeResponseMessage, sanitizeFromUrl } from "./helpers"
import type { ActionState } from "./types"

type GoogleAuthUrlPayload = {
  authUrl: string
}

type GoogleConnectCredentialsStatePayload = {
  valid: boolean
  status: string
  code: string
  message: string
  from: string
}

const googleConnectCredentialsCodeMessageMap: Record<string, string> = {
  GOOGLE_EMAIL_MUST_MATCH_CREDENTIAL_EMAIL:
    "Email Google tidak sama dengan email akun credentials Anda.",
}

const getGoogleConnectCredentialsStateMessage = (
  code?: string,
  message?: string,
  responseMessage?: string
): string => {
  if (code && googleConnectCredentialsCodeMessageMap[code]) {
    return googleConnectCredentialsCodeMessageMap[code]
  }

  if (message && message.trim().length > 0) {
    return message
  }

  return humanizeResponseMessage(responseMessage)
}

export type GoogleConnectCredentialsStateResult = {
  valid: boolean
  status: string
  code?: string
  message: string
  from: string
}

export const beginGoogleOAuthLoginAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(env.POSTMATIC_REFRESH_COOKIE_NAME)?.value

  const { ok, payload } = await callAuthApi<GoogleAuthUrlPayload>({
    method: "GET",
    path: `/api/account/google-oauth/login?from=${encodeURIComponent(from)}`,
    headers: refreshToken
      ? {
          "X-Postmatic-RefreshToken": refreshToken,
        }
      : undefined,
  })

  const authUrl = payload?.data?.authUrl

  if (!ok || !authUrl) {
    return {
      status: "error",
      message: humanizeResponseMessage(payload?.responseMessage),
      code: payload?.responseMessage,
    }
  }

  redirect(authUrl)
}

export const getGoogleConnectCredentialsStateStatus = async (
  token: string
): Promise<GoogleConnectCredentialsStateResult> => {
  if (!token) {
    return {
      valid: false,
      status: "failed",
      code: "INVALID_STATE",
      message: "State koneksi Google tidak ditemukan.",
      from: env.POSTMATIC_DEFAULT_FROM_URL,
    }
  }

  const encodedToken = encodeURIComponent(token)
  const { ok, payload } = await callAuthApi<GoogleConnectCredentialsStatePayload>({
    method: "GET",
    path: `/api/account/google-oauth/connect-credentials/state/${encodedToken}`,
  })

  const responseData = payload?.data

  if (!ok || !responseData) {
    return {
      valid: false,
      status: "failed",
      code: payload?.responseMessage,
      message: humanizeResponseMessage(payload?.responseMessage),
      from: env.POSTMATIC_DEFAULT_FROM_URL,
    }
  }

  return {
    valid: responseData.valid,
    status: responseData.status,
    code: responseData.code,
    message: getGoogleConnectCredentialsStateMessage(
      responseData.code,
      responseData.message,
      payload?.responseMessage
    ),
    from: sanitizeFromUrl(responseData.from),
  }
}
