"use client"

import { startTransition, useActionState, useMemo, useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"

import { initialActionState, registerAction } from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { TurnstileWidget } from "@/components/auth/turnstile-widget"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      confirmPassword: "",
    },
  })

  const password = useWatch({ control: form.control, name: "password" }) ?? ""
  const confirmPassword = useWatch({
    control: form.control,
    name: "confirmPassword",
  }) ?? ""

  const passwordMatchState = useMemo(() => {
    if (!confirmPassword.length) {
      return "idle"
    }

    return password === confirmPassword ? "match" : "mismatch"
  }, [confirmPassword, password])

  const submitRegister = form.handleSubmit((_values, event) => {
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
    <form onSubmit={submitRegister} className="space-y-4" noValidate>
      <input type="hidden" name="from" value={from} readOnly />

      <div>
        <Label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
          Full name
        </Label>
        <div className="relative">
          <User className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="name"
            placeholder="John Doe"
            aria-invalid={form.formState.errors.name ? "true" : "false"}
            className="h-auto w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pr-4 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
            {...form.register("name")}
          />
        </div>
        <FieldError className="mt-1.5" errors={[form.formState.errors.name]} />
      </div>

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
        <Label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
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
        <p className="mt-1.5 text-xs text-gray-500">
          Password must be minimum 6 characters and alphanumeric only.
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
            className="h-auto w-full rounded-xl border-gray-200 bg-gray-50/50 py-3 pr-11 pl-10 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
            {...form.register("confirmPassword")}
          />
          <button
            type="button"
            onClick={() => {
              setShowConfirmPassword((current) => !current)
            }}
            className="absolute top-1/2 right-3.5 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
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

      <div className="w-full">
        <TurnstileWidget
          onTokenStateChange={(hasToken) => {
            setTurnstileAccepted(hasToken)
          }}
        />
      </div>

      <div className="flex items-center space-x-2 py-1">
        <Checkbox 
          id="terms" 
          checked={termsAccepted} 
          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} 
        />
        <label
          htmlFor="terms"
          className="text-sm font-medium leading-none text-gray-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I agree to the{" "}
          <Link
            href="https://docs.postmatic.id/privacy-policy/terms-and-condition"
            target="_blank"
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Privacy Policy and Terms & Conditions
          </Link>
        </label>
      </div>

      <FormMessage state={state} />

      <Button
        type="submit"
        disabled={isPending || !turnstileAccepted || !termsAccepted}
        className="mt-2 h-auto w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all duration-200 hover:bg-blue-700 hover:shadow-blue-300"
      >
        {isPending ? "Creating account..." : "Create account"}
      </Button>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-600 transition-colors hover:text-blue-700">
          Login
        </Link>
      </p>
    </form>
  )
}
