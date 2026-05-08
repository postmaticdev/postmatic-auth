"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import {
  initialActionState,
  resendVerificationEmailAction,
  verifyAccountAction,
} from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  resendVerificationSchema,
  type ResendVerificationValues,
} from "@/lib/validation/auth"

import type { VerifyTokenStatusResult } from "@/action/verify-account"

type VerifyAccountFormProps = {
  token: string
  from: string
  status: VerifyTokenStatusResult
}

export function VerifyAccountForm({ token, from, status }: VerifyAccountFormProps) {
  const [verifyTurnstileAccepted, setVerifyTurnstileAccepted] = useState(false)
  const [resendTurnstileAccepted, setResendTurnstileAccepted] = useState(false)
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyAccountAction,
    initialActionState
  )
  const [resendState, resendAction, resendPending] = useActionState(
    resendVerificationEmailAction,
    initialActionState
  )

  const resendForm = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: status.email ?? "",
    },
  })

  const submitResend = resendForm.handleSubmit((_values, event) => {
    const formElement = event?.target as HTMLFormElement | undefined

    if (!formElement) {
      return
    }

    const payload = new FormData(formElement)
    resendAction(payload)
  })

  return (
    <div className="space-y-4">
      {status.valid ? (
        <Alert>
          <AlertTitle>Link verifikasi valid</AlertTitle>
          <AlertDescription>
            Lanjutkan verifikasi untuk akun {status.data?.email}.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertTitle>Link verifikasi bermasalah</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>
      )}

      {status.valid ? (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="token" value={token} readOnly />
          <input type="hidden" name="from" value={from} readOnly />
          <input type="hidden" name="email" value={status.data?.email ?? status.email ?? ""} readOnly />

          <TurnstileWidget
            onTokenStateChange={(hasToken) => {
              setVerifyTurnstileAccepted(hasToken)
            }}
          />
          <FormMessage state={verifyState} />

          <Button
            type="submit"
            size="lg"
            disabled={verifyPending || !verifyTurnstileAccepted}
            className="h-11 w-full rounded-xl bg-gradient-to-r from-[#3252e1] to-[#5b62ec] text-base font-semibold text-white hover:opacity-95"
          >
            {verifyPending ? "Verifying..." : "Verify account"}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitResend} className="space-y-4" noValidate>
          <input type="hidden" name="from" value={from} readOnly />
          <Input
            type="email"
            defaultValue={status.email ?? ""}
            placeholder="Masukkan email untuk kirim ulang verifikasi"
            aria-invalid={resendForm.formState.errors.email ? "true" : "false"}
            className="h-11 rounded-xl border-[#d8deea] px-3 text-sm"
            {...resendForm.register("email")}
          />
          <FieldError errors={[resendForm.formState.errors.email]} />

          <TurnstileWidget
            onTokenStateChange={(hasToken) => {
              setResendTurnstileAccepted(hasToken)
            }}
          />
          <FormMessage state={resendState} />

          <Button
            type="submit"
            variant="outline"
            size="lg"
            disabled={resendPending || !resendTurnstileAccepted}
            className="h-11 w-full rounded-xl border-[#cfd7e6] text-sm"
          >
            {resendPending ? "Mengirim ulang..." : "Resend verification email"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-[#5e6778]">
        Kembali ke{" "}
        <Link href="/login" className="font-semibold text-[#1f2937] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
