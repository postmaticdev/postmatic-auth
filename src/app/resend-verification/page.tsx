import type { Metadata } from "next"

import { AuthShell } from "@/components/auth/auth-shell"
import { ResendVerificationForm } from "@/components/auth/resend-verification-form"
import { sanitizeFromUrl } from "@/action/helpers"

export const metadata: Metadata = {
  title: "Resend Verification - Postmatic",
  description: "Resend your verification email for Postmatic.",
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ResendVerificationPage({ searchParams }: Props) {
  const params = await searchParams
  const from = sanitizeFromUrl(String(params.from ?? ""))
  const email = String(params.email ?? "")

  return (
    <AuthShell variant="login">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="mb-6 lg:hidden">
            <img
              src="/logofull.png"
              alt="Postmatic Logo"
              className="h-10 w-10 rounded-lg"
            />
          </div>
          <h2 className="mb-1 text-2xl font-bold text-gray-900">Resend Verification</h2>
          <p className="text-sm text-gray-500">
            Enter your email to receive a new verification link.
          </p>
        </div>

        <ResendVerificationForm from={from} initialEmail={email} />
      </div>
    </AuthShell>
  )
}
