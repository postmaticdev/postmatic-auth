"use client"

import { useActionState, useMemo, useState } from "react"
import Link from "next/link"
import { Building2, CalendarClock, Mail, UserRound, Users } from "lucide-react"

import {
  answerInviteMemberAction,
  initialActionState,
} from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

import type { InviteMemberVerifyResult } from "@/action/invite-member"

type InviteMemberFormProps = {
  token: string
  status: InviteMemberVerifyResult
}

const formatDateTime = (value?: string): string => {
  if (!value) {
    return "-"
  }

  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return "-"
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed)
}

const getSafeLogoUrl = (value?: string | null): string | null => {
  if (!value) {
    return null
  }

  try {
    const parsed = new URL(value)

    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString()
    }

    return null
  } catch {
    return null
  }
}

export function InviteMemberForm({ token, status }: InviteMemberFormProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<"accept" | "reject" | null>(
    null
  )
  const [answerState, answerAction, answerPending] = useActionState(
    answerInviteMemberAction,
    initialActionState
  )

  const invitation = status.data
  const logoUrl = useMemo(
    () => getSafeLogoUrl(invitation?.businessLogo),
    [invitation?.businessLogo]
  )

  if (!status.valid || !invitation) {
    return (
      <div className="space-y-5">
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
          <AlertTitle>Undangan tidak dapat diproses</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>

        <p className="text-center text-sm text-gray-500">
          <Link
            href="/login"
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Kembali ke login
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="border-blue-100 bg-blue-50 text-blue-900">
        <AlertTitle>Undangan valid</AlertTitle>
        <AlertDescription>
          Anda diundang untuk bergabung ke workspace bisnis di bawah ini.
        </AlertDescription>
      </Alert>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {logoUrl ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${logoUrl}')` }}
                aria-label="Business logo"
                role="img"
              />
            ) : (
              <Building2 className="h-5 w-5 text-gray-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {invitation.businessName}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                <Users className="h-3 w-3" />
                Role: {invitation.role}
              </Badge>
              {invitation.alreadyMember ? (
                <Badge variant="outline" className="border-green-200 text-green-700">
                  Already member
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-gray-400" />
            {invitation.profileName}
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            {invitation.profileEmail}
          </p>
          <p className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-gray-400" />
            Expired at: {formatDateTime(invitation.expiredAt)}
          </p>
        </div>
      </div>

      {invitation.alreadyMember ? (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertTitle>Anda sudah menjadi member</AlertTitle>
          <AlertDescription>
            Undangan ini sudah tidak memerlukan jawaban lagi.
          </AlertDescription>
        </Alert>
      ) : (
        <form action={answerAction} className="space-y-3">
          <input type="hidden" name="token" value={token} readOnly />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Button
              type="submit"
              name="answer"
              value="reject"
              variant="outline"
              disabled={answerPending}
              onClick={() => {
                setSelectedAnswer("reject")
              }}
              className="h-auto py-3 text-sm font-semibold"
            >
              {answerPending && selectedAnswer === "reject"
                ? "Rejecting..."
                : "Reject invitation"}
            </Button>

            <Button
              type="submit"
              name="answer"
              value="accept"
              disabled={answerPending}
              onClick={() => {
                setSelectedAnswer("accept")
              }}
              className="h-auto bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              {answerPending && selectedAnswer === "accept"
                ? "Accepting..."
                : "Accept invitation"}
            </Button>
          </div>
        </form>
      )}

      <FormMessage state={answerState} />
    </div>
  )
}
