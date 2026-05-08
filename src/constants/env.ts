const IS_SERVER = typeof window === "undefined"

const required = (key: string): string => {
  const value = process.env[key]?.trim()

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

const optional = (key: string, fallback = ""): string => {
  const value = process.env[key]?.trim()
  return value && value.length > 0 ? value : fallback
}

const asBoolean = (value: string, fallback: boolean): boolean => {
  const normalized = value.trim().toLowerCase()

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false
  }

  return fallback
}

const serverOnly = (key: string, fallback = ""): string => {
  if (!IS_SERVER) {
    return fallback
  }

  return required(key)
}

export const publicEnv = {
  // For client bundles, NEXT_PUBLIC_* must use direct property access
  // so Next.js can inline it at build/dev time.
  NEXT_PUBLIC_TURNSTILE_SITE_KEY:
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "",
} as const

export const env = {
  AUTH_API_BASE_URL: serverOnly("AUTH_API_BASE_URL").replace(/\/+$/, ""),
  POSTMATIC_APP_URL: optional("POSTMATIC_APP_URL", "https://auth.postmatic.id"),
  POSTMATIC_DEFAULT_FROM_URL: optional(
    "POSTMATIC_DEFAULT_FROM_URL",
    "https://dashboard.postmatic.id"
  ),
  POSTMATIC_COOKIE_DOMAIN: optional("POSTMATIC_COOKIE_DOMAIN", ".postmatic.id"),
  POSTMATIC_COOKIE_SECURE: asBoolean(
    optional(
      "POSTMATIC_COOKIE_SECURE",
      process.env.NODE_ENV === "production" ? "true" : "false"
    ),
    process.env.NODE_ENV === "production"
  ),
  POSTMATIC_ACCESS_COOKIE_NAME: optional(
    "POSTMATIC_ACCESS_COOKIE_NAME",
    "postmaticAccessToken"
  ),
  POSTMATIC_REFRESH_COOKIE_NAME: optional(
    "POSTMATIC_REFRESH_COOKIE_NAME",
    "postmaticRefreshToken"
  ),
  POSTMATIC_ACCESS_QUERY_KEY: optional(
    "POSTMATIC_ACCESS_QUERY_KEY",
    "postmaticAccessToken"
  ),
  POSTMATIC_REFRESH_QUERY_KEY: optional(
    "POSTMATIC_REFRESH_QUERY_KEY",
    "postmaticRefreshToken"
  ),
  POSTMATIC_REDIRECT_HOST_SUFFIX: optional(
    "POSTMATIC_REDIRECT_HOST_SUFFIX",
    ".postmatic.id"
  ),
  TURNSTILE_SECRET_KEY: serverOnly("TURNSTILE_SECRET_KEY"),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
} as const

export type Env = typeof env
export type PublicEnv = typeof publicEnv
