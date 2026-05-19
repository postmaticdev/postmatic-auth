"use server"

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
    "Akun platform yang dipilih tidak ditemukan atau tidak valid.",
  PLATFORM_SCOPES_NOT_FULFILLED:
    "Izin akses platform belum memenuhi kebutuhan integrasi.",
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

  let lastResult: AuthRequestResult<SocialPlatformPendingPayload> | null = null

  for (const path of paths) {
    const result = await callAuthApi<SocialPlatformPendingPayload>({
      method: "GET",
      path,
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
