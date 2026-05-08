import { env } from "@/constants"

export const sanitizeFromUrl = (input?: string | null): string => {
  const fallback = env.POSTMATIC_DEFAULT_FROM_URL

  if (!input) {
    return fallback
  }

  try {
    const parsed = new URL(input)
    const protocolAllowed = parsed.protocol === "https:" || parsed.protocol === "http:"

    if (!protocolAllowed) {
      return fallback
    }

    if (parsed.hostname === "localhost") {
      return parsed.toString()
    }

    if (parsed.hostname === "postmatic.id") {
      return parsed.toString()
    }

    if (parsed.hostname.endsWith(env.POSTMATIC_REDIRECT_HOST_SUFFIX)) {
      return parsed.toString()
    }

    return fallback
  } catch {
    return fallback
  }
}

export const humanizeResponseMessage = (value?: string): string => {
  if (!value) {
    return "Terjadi kesalahan. Coba lagi."
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0)}${part.slice(1).toLowerCase()}`)
    .join(" ")
}

export const buildRedirectWithTokens = (
  targetUrl: string,
  accessToken: string,
  refreshToken: string
): string => {
  const url = new URL(targetUrl)
  url.searchParams.set(env.POSTMATIC_ACCESS_QUERY_KEY, accessToken)
  url.searchParams.set(env.POSTMATIC_REFRESH_QUERY_KEY, refreshToken)
  return url.toString()
}
