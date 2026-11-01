import { isIP } from "node:net"
import { headers as getRequestHeaders } from "next/headers"

import { env } from "@/constants"

import type { AuthApiEnvelope } from "./types"

type RequestMethod = "GET" | "POST"

const REQUEST_TIMEOUT_MS = 20_000

type AuthRequestOptions = {
  method?: RequestMethod
  path: string
  body?: unknown
  headers?: Record<string, string>
}

export type AuthRequestResult<TData> = {
  ok: boolean
  status: number
  payload: AuthApiEnvelope<TData> | null
  // Detik dari header Retry-After (dikirim API bersama HTTP 429).
  retryAfter?: number
}

const parseRetryAfterHeader = (value: string | null): number | undefined => {
  if (!value) {
    return undefined
  }

  const seconds = Number(value.trim())
  if (Number.isFinite(seconds) && seconds > 0) {
    return Math.ceil(seconds)
  }

  const date = Date.parse(value)
  if (Number.isNaN(date)) {
    return undefined
  }

  const remaining = Math.ceil((date - Date.now()) / 1000)
  return remaining > 0 ? remaining : undefined
}

// The visitor's IP from the header the hosting edge sets (first entry of a
// forwarded list). Empty when unknown; the API then uses a shared bucket.
const getVisitorIp = async (): Promise<string> => {
  try {
    const requestHeaders = await getRequestHeaders()
    const ip = requestHeaders.get(env.AUTH_CLIENT_IP_HEADER)?.split(",")[0]?.trim() ?? ""
    return isIP(ip) ? ip : ""
  } catch {
    // Called outside a request (no headers available).
    return ""
  }
}

// Proves to the API that this call comes from the auth server, which already
// checked Turnstile, and passes the visitor's IP for per-visitor rate limits.
const getTrustedProxyHeaders = async (): Promise<Record<string, string>> => {
  if (!env.AUTH_TRUSTED_PROXY_SECRET) {
    return {}
  }

  const visitorIp = await getVisitorIp()
  return {
    "X-Auth-Proxy-Secret": env.AUTH_TRUSTED_PROXY_SECRET,
    ...(visitorIp ? { "X-Auth-Client-IP": visitorIp } : {}),
  }
}

export const callAuthApi = async <TData>({
  method = "GET",
  path,
  body,
  headers,
}: AuthRequestOptions): Promise<AuthRequestResult<TData>> => {
  let response: Response

  try {
    response = await fetch(`${env.AUTH_API_BASE_URL}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(await getTrustedProxyHeaders()),
        ...(headers ?? {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch {
    // API tidak terjangkau / timeout: kembalikan error terkontrol agar form
    // menampilkan pesan, bukan halaman error Next.js.
    return {
      ok: false,
      status: 503,
      payload: {
        responseMessage: "SERVICE_UNAVAILABLE",
      } as AuthApiEnvelope<TData>,
    }
  }

  let payload: AuthApiEnvelope<TData> | null = null

  try {
    payload = (await response.json()) as AuthApiEnvelope<TData>
  } catch {
    payload = null
  }

  const code = payload?.metaData?.code
  const ok = response.ok && (!code || (code >= 200 && code < 300))

  return {
    ok,
    status: response.status,
    payload,
    retryAfter: parseRetryAfterHeader(response.headers.get("Retry-After")),
  }
}
