"use client"

import { useActionState, useEffect, useRef } from "react"
import Link from "next/link"
import { AlertCircle, LoaderCircle } from "lucide-react"

import {
  consumeGoogleLoginTempStateAction,
  initialActionState,
} from "@/action"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

type GoogleCallbackConsumeFormProps = {
  token: string
  fallbackFrom: string
}

export function GoogleCallbackConsumeForm({
  token,
  fallbackFrom,
}: GoogleCallbackConsumeFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [state, formAction, isPending] = useActionState(
    consumeGoogleLoginTempStateAction,
    initialActionState
  )

  useEffect(() => {
    formRef.current?.requestSubmit()
  }, [])

  const hasError = state.status === "error"

  return (
    <div className="space-y-4">
      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="token" value={token} readOnly />
      </form>

      {!hasError ? (
        <Alert className="border-blue-100 bg-blue-50 text-blue-900">
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <AlertTitle>Memproses login Google</AlertTitle>
          <AlertDescription>
            Mohon tunggu, kami sedang memvalidasi sesi login Anda.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sesi login tidak valid</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {hasError ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button asChild variant="outline" className="h-11 sm:h-10 text-sm font-semibold">
            <Link href="/login">Kembali ke login</Link>
          </Button>

          <Button
            asChild
            className="order-first h-11 sm:order-none sm:h-10 bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Link href={fallbackFrom}>Kembali ke aplikasi</Link>
          </Button>
        </div>
      ) : isPending ? null : null}
    </div>
  )
}
