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

export type BusinessMemberInvitationPayload = {
  memberId: number
  profileName: string
  profileEmail: string
  profileId: string
  profileImage: string | null
  businessName: string
  businessRootId: number
  businessLogo: string | null
  role: string
  status?: string
  valid: boolean
  alreadyMember: boolean
  expiredAt: string
  createdAt: string
}

export type SocialPlatformBusinessPayload = {
  businessRootId: number
  name: string
  primaryLogoUrl: string | null
  category: string | null
  description: string | null
  websiteUrl: string | null
}

export type SocialPlatformAccountPayload = {
  tempCodeAccount: string
  platformUserId: string
  platformUserName: string
  platformUserEmail: string | null
  platformIconUrl: string | null
  platformScopes: string[]
}

export type SocialPlatformPendingPayload = {
  tempCode: string
  platformCode: string
  business: SocialPlatformBusinessPayload
  selectionRequired: boolean
  accounts: SocialPlatformAccountPayload[]
}

export type SocialPlatformConnectedPlatformPayload = {
  id: number
  businessRootId: number
  platformCode: string
  platformName: string
  platformId: number
  platformIsActive: boolean
  platformUserId: string
  platformIconUrl: string | null
  platformUserName: string
  platformUserEmail: string | null
  platformScopes: string[]
  platformTokenExpiredAt: string
  platformMetadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type SocialPlatformConnectPayload = {
  selectionRequired: boolean
  connectedPlatform: SocialPlatformConnectedPlatformPayload | null
  selectableAccounts: SocialPlatformAccountPayload[]
}

export type ForgotPasswordRequestPayload = {
  email: string
  retryAfter?: number
}

export type ForgotPasswordStatusPayload = {
  valid: boolean
  id: string
  name: string
  email: string
  imageUrl: string | null
  hasCredentialLogin?: boolean
}

export type ForgotPasswordResetPayload = {
  valid: boolean
  id: string
  name: string
  email: string
  imageUrl: string | null
}
