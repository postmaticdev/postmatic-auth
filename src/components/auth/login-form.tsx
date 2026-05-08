"use client"

import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Separator } from "@/components/ui/separator"
import { loginFormSchema, type LoginFormValues } from "@/lib/validation/auth"

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
    formAction(payload)
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
        <Button
          type="submit"
          variant="outline"
          size="lg"
          disabled={googlePending}
          className="h-11 w-full rounded-xl border-[#d8deea] text-base text-[#4b5568] hover:bg-[#f3f7ff]"
        >
          {googlePending ? "Preparing Google login..." : "Continue with Google"}
        </Button>
        <FormMessage state={googleState} />
      </form>

      <div className="flex items-center gap-4 py-1">
        <Separator className="bg-[#d7dce6]" />
        <span className="text-xs font-semibold tracking-[0.2em] text-[#9aa3b5]">
          OR
        </span>
        <Separator className="bg-[#d7dce6]" />
      </div>

      <form onSubmit={submitCredentials} className="space-y-4" noValidate>
        <input type="hidden" name="from" value={from} readOnly />

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-[#3a4558]">
            Email address
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="user@example.com"
            aria-invalid={form.formState.errors.email ? "true" : "false"}
            className="h-11 rounded-xl border-[#d8deea] px-3 text-sm"
            {...form.register("email")}
          />
          <FieldError errors={[form.formState.errors.email]} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm text-[#3a4558]">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="********"
            aria-invalid={form.formState.errors.password ? "true" : "false"}
            className="h-11 rounded-xl border-[#d8deea] px-3 text-sm"
            {...form.register("password")}
          />
          <FieldError errors={[form.formState.errors.password]} />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#58a365]">Turnstile enabled.</span>
          <a
            href="#"
            className="font-semibold text-[#4c5668] transition-colors hover:text-[#374151]"
          >
            Forgot password?
          </a>
        </div>

        <TurnstileWidget
          onTokenStateChange={(hasToken) => {
            setTurnstileAccepted(hasToken)
          }}
        />

        <FormMessage state={state} />

        <Button
          type="submit"
          size="lg"
          disabled={isPending || !turnstileAccepted}
          className="h-11 w-full rounded-xl bg-gradient-to-r from-[#3252e1] to-[#5b62ec] text-base font-semibold text-white hover:opacity-95"
        >
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-[#5e6778]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-[#1f2937] hover:underline">
          Sign up now
        </Link>
      </p>
    </div>
  )
}
