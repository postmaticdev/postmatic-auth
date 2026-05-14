"use client"

import { startTransition, useActionState, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
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
import { Label } from "@/components/ui/label"
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
    startTransition(() => {
      resendAction(payload)
    })
  })

  return (
    <div className="space-y-4">
      {status.valid ? (
        <Alert className="border-blue-100 bg-blue-50 text-blue-900">
          <AlertTitle>Verification link is valid</AlertTitle>
          <AlertDescription>
            Continue verification for {status.data?.email}.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
          <AlertTitle>Verification link has an issue</AlertTitle>
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
            disabled={verifyPending || !verifyTurnstileAccepted}
            className="mt-2 h-auto w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-300"
          >
            {verifyPending ? "Verifying..." : "Verify account"}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitResend} className="space-y-4" noValidate>
          <input type="hidden" name="from" value={from} readOnly />

          <div>
            <Label htmlFor="resend-email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Email address
            </Label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="resend-email"
                type="email"
                defaultValue={status.email ?? ""}
                placeholder="you@example.com"
                aria-invalid={resendForm.formState.errors.email ? "true" : "false"}
                className="h-auto w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
                {...resendForm.register("email")}
              />
            </div>
            <FieldError className="mt-1.5" errors={[resendForm.formState.errors.email]} />
          </div>

          <TurnstileWidget
            onTokenStateChange={(hasToken) => {
              setResendTurnstileAccepted(hasToken)
            }}
          />
          <FormMessage state={resendState} />

          <Button
            type="submit"
            disabled={resendPending || !resendTurnstileAccepted}
            className="mt-2 h-auto w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-300"
          >
            {resendPending ? "Sending..." : "Resend verification email"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-gray-500">
        Back to{" "}
        <Link href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
          Sign in
        </Link>
      </p>
    </div>
  )
}
