import { headers } from "next/headers"

import { env } from "@/constants"

type TurnstileResponse = {
  success: boolean
  "error-codes"?: string[]
}

export const verifyTurnstileToken = async (
  token: string
): Promise<{ ok: boolean; reason?: string }> => {
  if (!token) {
    return {
      ok: false,
      reason: "TURNSTILE_REQUIRED",
    }
  }

  const requestHeaders = await headers()
  const remoteIp = requestHeaders.get("cf-connecting-ip")
    ?? requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? ""

  const body = new URLSearchParams({
    secret: env.TURNSTILE_SECRET_KEY,
    response: token,
  })

  if (remoteIp) {
    body.set("remoteip", remoteIp)
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      cache: "no-store",
    }
  )

  const payload = (await response.json()) as TurnstileResponse

  if (payload.success) {
    return {
      ok: true,
    }
  }

  return {
    ok: false,
    reason: payload["error-codes"]?.[0] ?? "TURNSTILE_INVALID",
  }
}
