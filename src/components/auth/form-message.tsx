"use client"

import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import type { ActionState } from "@/action"

type FormMessageProps = {
  state: ActionState
}

type RetryCountdownProps = {
  retryAfter: number
}

function RetryCountdown({ retryAfter }: RetryCountdownProps) {
  const [secondsLeft, setSecondsLeft] = useState(retryAfter)

  useEffect(() => {
    if (retryAfter <= 0) {
      return
    }

    const endsAt = Date.now() + retryAfter * 1000
    const timer = setInterval(() => {
      const next = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
      setSecondsLeft(next)

      if (next === 0) {
        clearInterval(timer)
      }
    }, 250)

    return () => {
      clearInterval(timer)
    }
  }, [retryAfter])

  if (secondsLeft > 0) {
    return <> Anda dapat mencoba lagi dalam {secondsLeft} detik.</>
  }

  return <> Anda bisa mencoba lagi sekarang.</>
}

export function FormMessage({ state }: FormMessageProps) {
  if (state.status === "idle") {
    return null
  }

  const retryAfter =
    typeof state.retryAfter === "number" && state.retryAfter > 0
      ? Math.ceil(state.retryAfter)
      : 0

  const countdownKey = `${state.status}:${state.code ?? ""}:${state.message}:${retryAfter}`

  return (
    <Alert variant={state.status === "error" ? "destructive" : "default"}>
      <AlertTitle>
        {state.status === "error" ? "Permintaan gagal" : "Permintaan berhasil"}
      </AlertTitle>
      <AlertDescription>
        {state.message}
        {retryAfter > 0 ? (
          <RetryCountdown key={countdownKey} retryAfter={retryAfter} />
        ) : null}
      </AlertDescription>
    </Alert>
  )
}
