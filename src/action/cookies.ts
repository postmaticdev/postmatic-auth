import { cookies } from "next/headers"

import { env } from "@/constants"

const getMaxAgeFromJwt = (token: string): number | undefined => {
  const chunks = token.split(".")

  if (chunks.length !== 3) {
    return undefined
  }

  try {
    const payload = JSON.parse(
      Buffer.from(chunks[1], "base64url").toString("utf8")
    ) as { exp?: number }

    if (typeof payload.exp !== "number") {
      return undefined
    }

    const nowInSeconds = Math.floor(Date.now() / 1000)
    return Math.max(payload.exp - nowInSeconds, 0)
  } catch {
    return undefined
  }
}

type TokenPair = {
  accessToken: string
  refreshToken: string
}

export const setAuthCookies = async ({
  accessToken,
  refreshToken,
}: TokenPair): Promise<void> => {
  const cookieStore = await cookies()
  const accessTokenMaxAge = getMaxAgeFromJwt(accessToken)
  const refreshTokenMaxAge = getMaxAgeFromJwt(refreshToken)

  cookieStore.set({
    name: env.POSTMATIC_ACCESS_COOKIE_NAME,
    value: accessToken,
    httpOnly: false,
    sameSite: "lax",
    secure: env.POSTMATIC_COOKIE_SECURE,
    domain: env.POSTMATIC_COOKIE_DOMAIN,
    path: "/",
    priority: "high",
    ...(typeof accessTokenMaxAge === "number" ? { maxAge: accessTokenMaxAge } : {}),
  })

  cookieStore.set({
    name: env.POSTMATIC_REFRESH_COOKIE_NAME,
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure: env.POSTMATIC_COOKIE_SECURE,
    domain: env.POSTMATIC_COOKIE_DOMAIN,
    path: "/",
    priority: "high",
    ...(typeof refreshTokenMaxAge === "number" ? { maxAge: refreshTokenMaxAge } : {}),
  })
}
