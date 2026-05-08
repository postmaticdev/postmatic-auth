import { env } from "@/constants"

import type { AuthApiEnvelope } from "./types"

type RequestMethod = "GET" | "POST"

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
  const response = await fetch(`${env.AUTH_API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  })

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
