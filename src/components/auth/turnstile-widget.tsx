"use client"

import { useEffect, useRef, useState } from "react"

import { publicEnv } from "@/constants"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback": () => void
          "error-callback": () => void
          theme?: "light" | "dark" | "auto"
        }
      ) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

import type { ActionState } from "@/action/types"

type TurnstileWidgetProps = {
  inputName?: string
  onTokenStateChange?: (hasToken: boolean) => void
  actionState?: ActionState
}

const TURNSTILE_SCRIPT_ID = "postmatic-turnstile-script"

export function TurnstileWidget({
  inputName = "turnstileToken",
  onTokenStateChange,
  actionState,
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [token, setToken] = useState("")
  const [widgetReady, setWidgetReady] = useState(false)
  const [widgetError, setWidgetError] = useState<string>("")
  const siteKey = publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const missingSiteKey = !siteKey

  useEffect(() => {
    if (missingSiteKey) {
      return
    }

    let cancelled = false
    const parentForm = containerRef.current?.closest("form")

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile || widgetIdRef.current) {
        return
      }

      try {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (nextToken) => {
            setToken(nextToken)
            setWidgetReady(true)
            setWidgetError("")
            onTokenStateChange?.(Boolean(nextToken))
          },
          "expired-callback": () => {
            setToken("")
            setWidgetReady(false)
            onTokenStateChange?.(false)
          },
          "error-callback": () => {
            setToken("")
            setWidgetReady(false)
            setWidgetError("Gagal memuat challenge Turnstile, silakan refresh halaman.")
            onTokenStateChange?.(false)
          },
          theme: "light",
        })
      } catch {
        setWidgetError("Widget Turnstile gagal dirender.")
        onTokenStateChange?.(false)
      }
    }

    const ensureScript = () => {
      const existing = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null

      if (window.turnstile) {
        renderWidget()
        return
      }

      if (existing) {
        existing.addEventListener("load", renderWidget)
        existing.addEventListener("error", () => {
          setWidgetError("Script Turnstile gagal dimuat.")
          onTokenStateChange?.(false)
        })
        return
      }

      const script = document.createElement("script")
      script.id = TURNSTILE_SCRIPT_ID
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.addEventListener("load", renderWidget)
      script.addEventListener("error", () => {
        setWidgetError("Script Turnstile gagal dimuat.")
        onTokenStateChange?.(false)
      })
      document.head.appendChild(script)
    }

    ensureScript()

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [missingSiteKey, onTokenStateChange, siteKey])

  useEffect(() => {
    if (actionState?.status === "error" && widgetIdRef.current && window.turnstile) {
      window.turnstile.reset(widgetIdRef.current)
      setToken("")
      setWidgetReady(false)
      onTokenStateChange?.(false)
    }
  }, [actionState, onTokenStateChange])

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="flex min-h-[72px] w-full items-center justify-center py-2"
      />
      <input type="hidden" name={inputName} value={token} readOnly />
      {missingSiteKey ? (
        <p className="text-xs text-red-600">
          TURNSTILE site key belum di-set di NEXT_PUBLIC_TURNSTILE_SITE_KEY.
        </p>
      ) : widgetError ? (
        <p className="text-xs text-red-600">{widgetError}</p>
      ) : !widgetReady ? (
        <p className="text-xs text-[#7b859a]">
          Selesaikan verifikasi CAPTCHA sebelum submit.
        </p>
      ) : null}
    </div>
  )
}
