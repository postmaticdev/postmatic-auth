"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { env } from "@/constants"

import { callAuthApi } from "./auth-client"
import { setAuthCookies } from "./cookies"
import { humanizeResponseMessage, sanitizeFromUrl } from "./helpers"
import type { ActionState } from "./types"

type GoogleAuthUrlPayload = {
  authUrl: string
}

const oauthDebugEnabled =
  process.env.POSTMATIC_DEBUG_OAUTH === "true" || process.env.NODE_ENV !== "production"

const logGoogleOAuthDebug = (
  stage: string,
  payload: Record<string, unknown>
): void => {
  if (!oauthDebugEnabled) {
    return
  }

  console.info(`[google-oauth][${stage}]`, {
    timestamp: new Date().toISOString(),
    ...payload,
  })
}

const parseAuthUrlDebug = (authUrl: string): Record<string, unknown> => {
  try {
    const parsed = new URL(authUrl)

    return {
      authorizeHost: parsed.host,
      redirectUri: parsed.searchParams.get("redirect_uri"),
      clientId: parsed.searchParams.get("client_id"),
      responseType: parsed.searchParams.get("response_type"),
      scope: parsed.searchParams.get("scope"),
      stateLength: (parsed.searchParams.get("state") ?? "").length,
    }
  } catch {
    return {
      authUrlMalformed: true,
    }
  }
}

type GoogleConnectCredentialsStatePayload = {
  valid: boolean
  status: string
  code: string
  message: string
  from: string
}

type GoogleLoginTempStatePayload = {
  accessToken: string
  refreshToken: string
  from: string
}

const googleConnectCredentialsCodeMessageMap: Record<string, string> = {
  GOOGLE_EMAIL_MUST_MATCH_CREDENTIAL_EMAIL:
    "Email Google tidak sama dengan email akun credentials Anda.",
}

const googleLoginTempStateMessageMap: Record<string, string> = {
  GOOGLE_LOGIN_TEMP_STATE_INVALID:
    "Sesi login Google tidak valid atau sudah kedaluwarsa. Silakan login ulang.",
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

export type GoogleLoginTempStateConsumeResult = {
  ok: boolean
  code?: string
  message: string
  from: string
}

type GoogleLoginTempStateResolved = GoogleLoginTempStateConsumeResult & {
  accessToken?: string
  refreshToken?: string
}

export const beginGoogleOAuthLoginAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(env.POSTMATIC_REFRESH_COOKIE_NAME)?.value

  logGoogleOAuthDebug("begin_login.request", {
    from,
    hasRefreshToken: Boolean(refreshToken),
  })

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

  logGoogleOAuthDebug("begin_login.response", {
    ok,
    responseMessage: payload?.responseMessage,
    metaCode: payload?.metaData?.code,
    metaRequestId: payload?.metaData?.requestId,
    metaPath: payload?.metaData?.path,
    metaMethod: payload?.metaData?.method,
    hasAuthUrl: Boolean(authUrl),
    ...(!authUrl ? {} : parseAuthUrlDebug(authUrl)),
  })

  if (!ok || !authUrl) {
    return {
      status: "error",
      message: humanizeResponseMessage(payload?.responseMessage),
      code: payload?.responseMessage,
    }
  }

  logGoogleOAuthDebug("begin_login.redirect", {
    toGoogleAuthorize: true,
  })

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

const resolveGoogleLoginTempState = async (
  token: string
): Promise<GoogleLoginTempStateResolved> => {
  if (!token) {
    return {
      ok: false,
      code: "GOOGLE_LOGIN_TEMP_STATE_INVALID",
      message:
        googleLoginTempStateMessageMap.GOOGLE_LOGIN_TEMP_STATE_INVALID,
      from: env.POSTMATIC_DEFAULT_FROM_URL,
    }
  }

  const encodedToken = encodeURIComponent(token)
  const { ok, payload } = await callAuthApi<GoogleLoginTempStatePayload>({
    method: "GET",
    path: `/api/account/google-oauth/temp-state/${encodedToken}`,
  })

  const data = payload?.data

  if (!ok || !data?.accessToken || !data?.refreshToken) {
    return {
      ok: false,
      code: payload?.responseMessage,
      message:
        googleLoginTempStateMessageMap[payload?.responseMessage ?? ""] ??
        humanizeResponseMessage(payload?.responseMessage),
      from: env.POSTMATIC_DEFAULT_FROM_URL,
    }
  }

  const from = sanitizeFromUrl(data.from)

  return {
    ok: true,
    code: payload?.responseMessage,
    message: "Sesi login Google berhasil diproses.",
    from,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  }
}

export const consumeGoogleLoginTempState = async (
  token: string
): Promise<GoogleLoginTempStateConsumeResult> => {
  const resolved = await resolveGoogleLoginTempState(token)

  if (!resolved.ok || !resolved.accessToken || !resolved.refreshToken) {
    return resolved
  }

  await setAuthCookies({
    accessToken: resolved.accessToken,
    refreshToken: resolved.refreshToken,
  })

  redirect(resolved.from)
}

export const consumeGoogleLoginTempStateAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const token = String(formData.get("token") ?? "").trim()
  const resolved = await resolveGoogleLoginTempState(token)

  if (!resolved.ok || !resolved.accessToken || !resolved.refreshToken) {
    return {
      status: "error",
      code: resolved.code,
      message: resolved.message,
    }
  }

  await setAuthCookies({
    accessToken: resolved.accessToken,
    refreshToken: resolved.refreshToken,
  })

  redirect(resolved.from)
}
