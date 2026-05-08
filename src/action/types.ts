export type ActionState = {
  status: "idle" | "success" | "error"
  message: string
  code?: string
  retryAfter?: number
}

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
}

export type AuthApiEnvelope<TData> = {
  metaData?: {
    code?: number
    message?: string
  }
  responseMessage?: string
  data?: TData | null
}

export type AuthUser = {
  id: string
  name: string
  email: string
  imageUrl: string | null
}

export type AuthLoginPayload = AuthUser & {
  accessToken: string
  refreshToken: string
  retryAfter: number
}

export type AuthRegisterPayload = AuthUser & {
  retryAfter: number
}

export type AuthVerifyStatusPayload = AuthUser & {
  valid: boolean
}

export type AuthVerifyPayload = AuthVerifyStatusPayload & {
  accessToken: string
  refreshToken: string
}
