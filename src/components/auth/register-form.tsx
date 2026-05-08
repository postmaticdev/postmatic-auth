"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { initialActionState, registerAction } from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  registerFormSchema,
  type RegisterFormValues,
} from "@/lib/validation/auth"

type RegisterFormProps = {
  from: string
}

export function RegisterForm({ from }: RegisterFormProps) {
  const [turnstileAccepted, setTurnstileAccepted] = useState(false)
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialActionState
  )

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  const submitRegister = form.handleSubmit((_values, event) => {
    const formElement = event?.target as HTMLFormElement | undefined

    if (!formElement) {
      return
    }

    const payload = new FormData(formElement)
    formAction(payload)
  })

  return (
    <form onSubmit={submitRegister} className="space-y-4" noValidate>
      <input type="hidden" name="from" value={from} readOnly />

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm text-[#3a4558]">
          Full name
        </Label>
        <Input
          id="name"
          placeholder="Your name"
          aria-invalid={form.formState.errors.name ? "true" : "false"}
          className="h-11 rounded-xl border-[#d8deea] px-3 text-sm"
          {...form.register("name")}
        />
        <FieldError errors={[form.formState.errors.name]} />
      </div>

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
          autoComplete="new-password"
          placeholder="Minimum 6 alphanumeric characters"
          aria-invalid={form.formState.errors.password ? "true" : "false"}
          className="h-11 rounded-xl border-[#d8deea] px-3 text-sm"
          {...form.register("password")}
        />
        <FieldError errors={[form.formState.errors.password]} />
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
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-[#5e6778]">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-[#1f2937] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
