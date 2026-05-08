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
