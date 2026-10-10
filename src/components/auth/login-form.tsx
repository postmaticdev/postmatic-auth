"use client"

import { startTransition, useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"
import { useForm } from "react-hook-form"

import {
  beginGoogleOAuthLoginAction,
  initialActionState,
  loginAction,
} from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginFormSchema, type LoginFormValues } from "@/lib/validation/auth"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

type LoginFormProps = {
  from: string
  initialEmail?: string
  notice?: string
  focusPassword?: boolean
}

export function LoginForm({
  from,
  initialEmail = "",
  notice,
  focusPassword = false,
}: LoginFormProps) {
  const [turnstileAccepted, setTurnstileAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [googleState, googleAction, googlePending] = useActionState(
    beginGoogleOAuthLoginAction,
    initialActionState
  )
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialActionState
  )

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: initialEmail,
      password: "",
    },
  })

  useEffect(() => {
    if (!focusPassword) {
      return
    }

    form.setFocus("password")
  }, [focusPassword, form])

  const submitCredentials = form.handleSubmit((_values, event) => {
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
      {notice ? (
        <Alert>
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      ) : null}

      <form action={googleAction} className="space-y-2">
        <input type="hidden" name="from" value={from} readOnly />
        <button
          type="submit"
          disabled={googlePending}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="flex items-center justify-center gap-3">
            <GoogleIcon />
            {googlePending ? "Preparing Google login..." : "Continue with Google"}
          </span>
        </button>
        <FormMessage state={googleState} />
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs font-medium text-gray-400">or</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>

      <form onSubmit={submitCredentials} className="space-y-4" noValidate>
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
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={form.formState.errors.email ? "true" : "false"}
              className="h-auto w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
              {...form.register("email")}
            />
          </div>
          <FieldError className="mt-1.5" errors={[form.formState.errors.email]} />
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={form.formState.errors.password ? "true" : "false"}
              className="h-auto w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pr-11 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => {
                setShowPassword((current) => !current)
              }}
              className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <FieldError className="mt-1.5" errors={[form.formState.errors.password]} />
        </div>

        <div className="flex items-center justify-center py-2">
          <TurnstileWidget
            onTokenStateChange={(hasToken) => {
              setTurnstileAccepted(hasToken)
            }}
          />
        </div>

        <FormMessage state={state} />

        <Button
          type="submit"
          disabled={isPending || !turnstileAccepted}
          className="mt-2 h-auto w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-300"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
          Sign up
        </Link>
      </p>
    </div>
  )
}
