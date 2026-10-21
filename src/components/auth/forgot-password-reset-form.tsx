"use client"

import { startTransition, useActionState, useMemo, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import {
  initialActionState,
  submitForgotPasswordResetAction,
} from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  forgotPasswordResetSchema,
  NEW_PASSWORD_HINT,
  type ForgotPasswordResetValues,
} from "@/lib/validation/auth"

type ForgotPasswordResetFormProps = {
  token: string
  status: {
    valid: boolean
    message: string
    code?: string
    email?: string
  }
}

export function ForgotPasswordResetForm({
  token,
  status,
}: ForgotPasswordResetFormProps) {
  const [turnstileAccepted, setTurnstileAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [state, formAction, isPending] = useActionState(
    submitForgotPasswordResetAction,
    initialActionState
  )

  const form = useForm<ForgotPasswordResetValues>({
    resolver: zodResolver(forgotPasswordResetSchema),
    defaultValues: {
      email: status.email ?? "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const newPassword = useWatch({ control: form.control, name: "newPassword" }) ?? ""
  const confirmPassword =
    useWatch({ control: form.control, name: "confirmPassword" }) ?? ""

  const passwordMatchState = useMemo(() => {
    if (!confirmPassword.length) {
      return "idle"
    }

    return newPassword === confirmPassword ? "match" : "mismatch"
  }, [confirmPassword, newPassword])

  const submitResetPassword = form.handleSubmit((_values, event) => {
    const formElement = event?.target as HTMLFormElement | undefined

    if (!formElement) {
      return
    }

    const payload = new FormData(formElement)
    startTransition(() => {
      formAction(payload)
    })
  })

  if (!status.valid) {
    return (
      <div className="space-y-5">
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
          <AlertTitle>Link reset password bermasalah</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>

        <p className="text-center text-sm text-gray-500">
          <Link
            href="/forgot-password"
            className="-my-2 inline-flex items-center gap-1.5 py-2 font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Request new reset link
          </Link>
        </p>
      </div>
    )
  }

  return (
    <>
      <Alert className="border-blue-100 bg-blue-50 text-blue-900">
        <AlertTitle>Link reset password valid</AlertTitle>
        <AlertDescription>
          Set password baru untuk akun {status.email}.
        </AlertDescription>
      </Alert>

      <form onSubmit={submitResetPassword} className="space-y-4" noValidate>
        <input type="hidden" name="token" value={token} readOnly />

        <div>
          <Label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="email"
              readOnly
              aria-readonly="true"
              className="h-11 sm:h-10 w-full rounded-xl border-gray-200 bg-gray-100 pr-4 pl-10 text-base sm:text-sm text-gray-600"
              {...form.register("email")}
            />
          </div>
          <FieldError className="mt-1.5" errors={[form.formState.errors.email]} />
        </div>

        <div>
          <Label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
            New password
          </Label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="newPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a strong password"
              aria-invalid={form.formState.errors.newPassword ? "true" : "false"}
              className="h-11 sm:h-10 w-full rounded-xl border-gray-200 bg-gray-50/50 pr-11 pl-10 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
              {...form.register("newPassword")}
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword((current) => !current)
              }}
              className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError className="mt-1.5" errors={[form.formState.errors.newPassword]} />
          <p className="mt-1.5 text-xs text-gray-500">
            {NEW_PASSWORD_HINT}
          </p>
        </div>

        <div>
          <Label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            Confirm password
          </Label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={form.formState.errors.confirmPassword ? "true" : "false"}
              className="h-11 sm:h-10 w-full rounded-xl border-gray-200 bg-gray-50/50 pr-11 pl-10 text-base sm:text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
              {...form.register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => {
                setShowConfirmPassword((current) => !current)
              }}
              className="absolute top-1/2 right-1 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <FieldError className="mt-1.5" errors={[form.formState.errors.confirmPassword]} />
          {passwordMatchState === "mismatch" ? (
            <p className="mt-1.5 text-xs text-red-500">Passwords do not match.</p>
          ) : null}
          {passwordMatchState === "match" ? (
            <p className="mt-1.5 text-xs text-green-600">Passwords match.</p>
          ) : null}
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
          {isPending ? "Confirming..." : "Confirm"}
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
