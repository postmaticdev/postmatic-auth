"use client"

import { startTransition, useActionState, useMemo, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Mail, MailCheck } from "lucide-react"
import { useForm } from "react-hook-form"

import { initialActionState, requestForgotPasswordAction } from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  forgotPasswordRequestSchema,
  type ForgotPasswordRequestValues,
} from "@/lib/validation/auth"

export function ForgotPasswordRequestForm() {
  const [turnstileAccepted, setTurnstileAccepted] = useState(false)
  const [dismissedSuccess, setDismissedSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [state, formAction, isPending] = useActionState(
    requestForgotPasswordAction,
    initialActionState
  )

  const form = useForm<ForgotPasswordRequestValues>({
    resolver: zodResolver(forgotPasswordRequestSchema),
    defaultValues: {
      email: "",
    },
  })

  const sent = useMemo(
    () => state.status === "success" && !dismissedSuccess,
    [dismissedSuccess, state.status]
  )

  const submitForgotPassword = form.handleSubmit((values, event) => {
    const formElement = event?.target as HTMLFormElement | undefined

    if (!formElement) {
      return
    }

    setDismissedSuccess(false)
    setSubmittedEmail(values.email)
    const payload = new FormData(formElement)
    startTransition(() => {
      formAction(payload)
    })
  })

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center" role="status" aria-live="polite">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
          <MailCheck className="h-8 w-8 text-blue-600" strokeWidth={1.75} />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Check your email</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-500">
          If an account exists for{" "}
          <span className="font-medium break-all text-gray-900">{submittedEmail}</span>, you
          will receive a password reset link shortly.
        </p>

        <Button
          asChild
          className="mt-8 h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 sm:h-10"
        >
          <Link href="/login">Back to login</Link>
        </Button>

        <p className="mt-6 text-sm text-gray-500">
          Didn&apos;t get it?{" "}
          <button
            type="button"
            onClick={() => {
              setDismissedSuccess(true)
            }}
            className="-my-2 py-2 font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Resend
          </button>
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8 text-center lg:text-left">
        <h2 className="mb-1 text-2xl font-bold text-gray-900">Forgot password?</h2>
        <p className="text-sm leading-relaxed text-gray-500">
          No worries! Enter your email below and we will send you a secure reset link.
        </p>
      </div>

      <form onSubmit={submitForgotPassword} className="space-y-4" noValidate>
        <div>
          <Label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              aria-invalid={form.formState.errors.email ? "true" : "false"}
              className="h-11 sm:h-10 w-full rounded-xl border-gray-200 bg-gray-50/50 pr-4 pl-10 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
              {...form.register("email")}
            />
          </div>
          <FieldError className="mt-1.5" errors={[form.formState.errors.email]} />
        </div>

        <TurnstileWidget
          actionState={state}
          onTokenStateChange={(hasToken) => {
            setTurnstileAccepted(hasToken)
          }}
        />

        <FormMessage state={state} />

        <Button
          type="submit"
          disabled={isPending || !turnstileAccepted}
          className="h-11 sm:h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-300"
        >
          {isPending ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        <Link
          href="/login"
          className="-my-2 inline-flex items-center gap-1.5 py-2 font-semibold text-blue-600 transition-colors hover:text-blue-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </p>
    </>
  )
}
