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
  }
}
