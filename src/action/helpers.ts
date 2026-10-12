import { env } from "@/constants"

// Sama dengan newPasswordSchema di lib/validation/auth.ts.
const NEW_PASSWORD_REGEX = /^[\x20-\x7E]{6,72}$/

export const getNewPasswordError = (password: string): string | null => {
  if (password !== password.trim()) {
    return "Password tidak boleh diawali atau diakhiri spasi."
  }
  if (!NEW_PASSWORD_REGEX.test(password)) {
    return "Password harus 6-72 karakter dan hanya berisi huruf, angka, atau simbol standar."
  }
  return null
}

const LOCAL_DEV_HOSTNAMES = new Set(["localhost", "127.0.0.1"])

export const isLocalDevHostname = (hostname: string): boolean =>
  LOCAL_DEV_HOSTNAMES.has(hostname.toLowerCase())

export const sanitizeFromUrl = (input?: string | null): string => {
  const fallback = env.POSTMATIC_DEFAULT_FROM_URL

  if (!input) {
    return fallback
  }

  try {
    const parsed = new URL(input)

    // http hanya untuk dev lokal; domain Postmatic wajib https agar token/
    // cookie tidak pernah dikirim lewat koneksi tanpa enkripsi.
    if (isLocalDevHostname(parsed.hostname)) {
      return parsed.protocol === "http:" || parsed.protocol === "https:"
        ? parsed.toString()
        : fallback
    }

    if (parsed.protocol !== "https:") {
      return fallback
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

  if (value === "SERVICE_UNAVAILABLE") {
    return "Server sedang tidak dapat dihubungi. Coba lagi beberapa saat."
  }

  return value
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0)}${part.slice(1).toLowerCase()}`)
    .join(" ")
}

/**
 * Token hanya ditempel ke URL untuk tujuan localhost (dev app lokal dengan auth
 * staging/production), karena cookie domain .postmatic.id tidak bisa sampai
 * ke localhost. Untuk domain Postmatic sesi sudah ada di cookie, jadi token
 * tidak boleh muncul di URL (bocor ke history, log, Referer).
 */
export const buildRedirectWithTokens = (
  targetUrl: string,
  accessToken: string,
  refreshToken: string
): string => {
  const url = new URL(targetUrl)
  if (!isLocalDevHostname(url.hostname)) {
    return url.toString()
  }
  url.searchParams.set(env.POSTMATIC_ACCESS_QUERY_KEY, accessToken)
  url.searchParams.set(env.POSTMATIC_REFRESH_QUERY_KEY, refreshToken)
  return url.toString()
}
