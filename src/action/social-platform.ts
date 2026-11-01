"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { env } from "@/constants"

import { callAuthApi, type AuthRequestResult } from "./auth-client"
import { humanizeResponseMessage, sanitizeFromUrl } from "./helpers"
import type {
  ActionState,
  SocialPlatformConnectPayload,
  SocialPlatformPendingPayload,
} from "./types"

const socialPlatformResponseMessageMap: Record<string, string> = {
  SUCCESS_GET_PENDING_CONNECTED_PLATFORM_OAUTH:
    "Data koneksi platform berhasil dimuat.",
  SUCCESS_CONNECT_PLATFORM: "Akun platform berhasil terhubung.",
  CONNECTED_PLATFORM_TEMP_CODE_ACCOUNT_NOT_FOUND:
    "Akun platform yang dipilih tidak ditemukan. Link koneksi ini mungkin sudah dipakai atau kedaluwarsa.",
  // Kode koneksi hanya bisa dipakai sekali dan berlaku singkat.
  CONNECTED_PLATFORM_TEMP_CODE_NOT_FOUND:
    "Link koneksi ini sudah dipakai atau kedaluwarsa. Mulai ulang koneksi dari workspace.",
  PLATFORM_SCOPES_NOT_FULFILLED:
    "Izin akses platform belum memenuhi kebutuhan integrasi.",
  PLATFORM_ALREADY_CONNECTED:
    "Platform ini sudah terhubung ke bisnis tersebut. Putuskan koneksi lama di workspace bila ingin menggantinya.",
  PLATFORM_ACCOUNT_SELECTION_REQUIRED: "Pilih salah satu akun platform terlebih dahulu.",
  MISSING_TOKEN:
    "Masuk ke akun Postmatic yang memulai koneksi ini untuk melanjutkan.",
  MISSING_AUTH_CONTEXT:
    "Masuk ke akun Postmatic yang memulai koneksi ini untuk melanjutkan.",
  INVALID_OR_EXPIRED_TOKEN:
    "Sesi Anda telah berakhir. Masuk kembali untuk melanjutkan koneksi ini.",
  CONNECTED_PLATFORM_OAUTH_INITIATOR_MISMATCH:
    "Koneksi ini dimulai oleh akun Postmatic lain. Masuk dengan akun yang memulainya.",
  CONNECTED_PLATFORM_OAUTH_CAPABILITY_INVALID:
    "Anda tidak lagi memiliki akses untuk menghubungkan platform ke bisnis ini. Hanya Owner bisnis yang dapat menghubungkan platform.",
  CONNECTED_PLATFORM_OWNER_REQUIRED:
    "Hanya Owner bisnis yang dapat menghubungkan platform sosial media.",
  FORBIDDEN: "Anda tidak memiliki akses untuk menghubungkan platform ke bisnis ini.",
  // Error dari callback OAuth (dikirim lewat query connectedPlatformError).
  CONNECTED_PLATFORM_STATE_ALREADY_USED:
    "Link koneksi ini sudah dipakai atau kedaluwarsa. Mulai ulang koneksi dari workspace.",
  CONNECTED_PLATFORM_AUTHORIZATION_CANCELLED:
    "Koneksi dibatalkan di halaman platform. Mulai ulang koneksi dari workspace bila ingin mencoba lagi.",
}

// The API only lets the signed-in user who started the connection see or confirm it, so the
// Postmatic session cookie (shared across *.postmatic.id) is forwarded as a bearer token.
const getSessionHeaders = async (): Promise<Record<string, string> | undefined> => {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(env.POSTMATIC_ACCESS_COOKIE_NAME)?.value

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined
}

const getSocialPlatformMessage = (responseMessage?: string): string => {
  if (!responseMessage) {
    return "Terjadi kesalahan. Coba lagi."
  }

  return (
    socialPlatformResponseMessageMap[responseMessage] ??
    humanizeResponseMessage(responseMessage)
  )
}

// The OAuth callback failed before a connection code was issued (status "failed" or "cancelled"),
// so there is nothing to load from the API; only the error code is shown.
export const getSocialPlatformCallbackFailureStatus = async (
  code?: string
): Promise<SocialPlatformPendingStatusResult> => ({
  valid: false,
  message: getSocialPlatformMessage(code),
  code,
  data: null,
})

const buildPendingPaths = (token: string): string[] => {
  const encodedToken = encodeURIComponent(token)
  const paths = new Set<string>()

  paths.add(`/api/business/connected-platform/~/oauth/pending/${encodedToken}`)

  const configuredBusinessRootId = env.POSTMATIC_SOCIAL_PLATFORM_BUSINESS_ROOT_ID
  if (configuredBusinessRootId) {
    paths.add(
      `/api/business/connected-platform/${configuredBusinessRootId}/oauth/pending/${encodedToken}`
    )
  }

  return Array.from(paths)
}

const isPendingPayloadValid = (
  payload?: SocialPlatformPendingPayload | null
): payload is SocialPlatformPendingPayload => {
  if (!payload) {
    return false
  }

  if (!payload.business || typeof payload.business.businessRootId !== "number") {
    return false
  }

  return Array.isArray(payload.accounts)
}

export type SocialPlatformPendingStatusResult = {
  valid: boolean
  message: string
  code?: string
  data: SocialPlatformPendingPayload | null
}

export const getSocialPlatformPendingStatus = async (
  token: string
): Promise<SocialPlatformPendingStatusResult> => {
  if (!token) {
    return {
      valid: false,
      message: "Kode koneksi platform tidak ditemukan.",
      code: "CONNECTED_PLATFORM_TEMP_CODE_ACCOUNT_NOT_FOUND",
      data: null,
    }
  }

  const paths = buildPendingPaths(token)
  const headers = await getSessionHeaders()

  let lastResult: AuthRequestResult<SocialPlatformPendingPayload> | null = null

  for (const path of paths) {
    const result = await callAuthApi<SocialPlatformPendingPayload>({
      method: "GET",
      path,
      headers,
    })
    lastResult = result

    if (result.ok && isPendingPayloadValid(result.payload?.data)) {
      return {
        valid: true,
        message: getSocialPlatformMessage(result.payload?.responseMessage),
        code: result.payload?.responseMessage,
        data: result.payload.data,
      }
    }

    // Login/akses ditolak: path lain tidak akan mengubah hasil, dan kode
    // error yang spesifik ini yang perlu ditampilkan.
    if (result.status === 401 || result.status === 403) {
      break
    }
  }

  return {
    valid: false,
    message: getSocialPlatformMessage(lastResult?.payload?.responseMessage),
    code: lastResult?.payload?.responseMessage,
    data: null,
  }
}

export const connectSocialPlatformAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const from = sanitizeFromUrl(String(formData.get("from") ?? ""))
  const tempCodeAccount = String(formData.get("tempCodeAccount") ?? "").trim()
  const businessRootId = Number(String(formData.get("businessRootId") ?? "").trim())

  if (!tempCodeAccount) {
    return {
      status: "error",
      message: "Pilih akun platform terlebih dahulu.",
      code: "CONNECTED_PLATFORM_TEMP_CODE_ACCOUNT_NOT_FOUND",
    }
  }

  if (!Number.isFinite(businessRootId) || businessRootId <= 0) {
    return {
      status: "error",
      message: "Business ID tidak valid.",
      code: "INVALID_BUSINESS_ROOT_ID",
    }
  }

  const { ok, payload } = await callAuthApi<SocialPlatformConnectPayload>({
    method: "POST",
    path: `/api/business/connected-platform/${businessRootId}/connect-account`,
    body: {
      tempCodeAccount,
    },
    headers: await getSessionHeaders(),
  })

  if (!ok || !payload?.data) {
    return {
      status: "error",
      message: getSocialPlatformMessage(payload?.responseMessage),
      code: payload?.responseMessage,
    }
  }

  redirect(from || env.POSTMATIC_DEFAULT_FROM_URL)
}
