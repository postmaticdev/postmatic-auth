"use server"

import { redirect } from "next/navigation"

import { env } from "@/constants"

import { callAuthApi } from "./auth-client"
import { humanizeResponseMessage } from "./helpers"
import type { ActionState, BusinessMemberInvitationPayload } from "./types"

const inviteMemberResponseMessageMap: Record<string, string> = {
  SUCCESS_VERIFY_BUSINESS_MEMBER: "Undangan member berhasil diverifikasi.",
  SUCCESS_ANSWER_BUSINESS_MEMBER_INVITATION:
    "Jawaban undangan member berhasil diproses.",
  INVALID_TOKEN: "Link undangan tidak valid.",
  PROFILE_NOT_FOUND: "Profil akun tidak ditemukan.",
  MEMBER_ALREADY_ANSWERED: "Undangan ini sudah pernah dijawab.",
  TOKEN_EXPIRED: "Link undangan sudah kedaluwarsa.",
}

const getInviteMemberMessage = (responseMessage?: string): string => {
  if (!responseMessage) {
    return "Terjadi kesalahan. Coba lagi."
  }

  return (
    inviteMemberResponseMessageMap[responseMessage] ??
    humanizeResponseMessage(responseMessage)
  )
}

export type InviteMemberVerifyResult = {
  valid: boolean
  message: string
  code?: string
  data: BusinessMemberInvitationPayload | null
}

export const getInviteMemberStatus = async (
  token: string
): Promise<InviteMemberVerifyResult> => {
  if (!token) {
    return {
      valid: false,
      message: "Link undangan tidak ditemukan.",
      code: "INVALID_TOKEN",
      data: null,
    }
  }

  const encodedToken = encodeURIComponent(token)

  const { ok, payload } = await callAuthApi<BusinessMemberInvitationPayload>({
    method: "GET",
    path: `/api/business/member/~/${encodedToken}/verify`,
  })

  if (!ok || !payload?.data) {
    return {
      valid: false,
      message: getInviteMemberMessage(payload?.responseMessage),
      code: payload?.responseMessage,
      data: null,
    }
  }

  return {
    valid: payload.data.valid,
    message: getInviteMemberMessage(payload.responseMessage),
    code: payload.responseMessage,
    data: payload.data,
  }
}

export const answerInviteMemberAction = async (
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> => {
  const token = String(formData.get("token") ?? "").trim()
  const answer = String(formData.get("answer") ?? "").trim().toLowerCase()

  if (!token) {
    return {
      status: "error",
      message: "Link undangan tidak ditemukan.",
      code: "INVALID_TOKEN",
    }
  }

  if (answer !== "accept" && answer !== "reject") {
    return {
      status: "error",
      message: "Pilihan jawaban undangan tidak valid.",
      code: "INVALID_ANSWER",
    }
  }

  const encodedToken = encodeURIComponent(token)

  const { ok, payload } = await callAuthApi<BusinessMemberInvitationPayload>({
    method: "POST",
    path: `/api/business/member/~/${encodedToken}/answer`,
    body: {
      answer,
    },
  })

  if (!ok || !payload?.data) {
    return {
      status: "error",
      message: getInviteMemberMessage(payload?.responseMessage),
      code: payload?.responseMessage,
    }
  }

  redirect(env.POSTMATIC_DEFAULT_FROM_URL)
}
