"use client"

import { startTransition, useActionState, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Mail } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  initialActionState,
  resendVerificationEmailAction,
} from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  resendVerificationSchema,
  type ResendVerificationValues,
} from "@/lib/validation/auth"

type ResendVerificationFormProps = {
  from: string
  initialEmail?: string
}

export function ResendVerificationForm({ from, initialEmail = "" }: ResendVerificationFormProps) {
  const [turnstileAccepted, setTurnstileAccepted] = useState(false)
  const [state, formAction, isPending] = useActionState(
    resendVerificationEmailAction,
    initialActionState
  )

  const form = useForm<ResendVerificationValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: initialEmail,
    },
  })

  const submitResend = form.handleSubmit((_values, event) => {
    const formElement = event?.target as HTMLFormElement | undefined

    if (!formElement) {
      return
    }

    const payload = new FormData(formElement)
    startTransition(() => {
      formAction(payload)
    })
  })

  return (
    <div className="space-y-4">
      <form onSubmit={submitResend} className="space-y-4" noValidate>
        <input type="hidden" name="from" value={from} readOnly />

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

        <div className="w-full">
          <TurnstileWidget
            actionState={state}
            onTokenStateChange={(hasToken) => {
              setTurnstileAccepted(hasToken)
            }}
          />
        </div>
        <FormMessage state={state} />

        <Button
          type="submit"
          disabled={isPending || !turnstileAccepted}
          className="mt-2 h-11 sm:h-10 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-300"
        >
          {isPending ? "Sending..." : "Resend verification email"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Back to{" "}
        <Link href="/login" className="-my-2 inline-block py-2 font-semibold text-blue-600 transition-colors hover:text-blue-700">
          SIGN IN
        </Link>
      </p>
    </div>
  )
}
