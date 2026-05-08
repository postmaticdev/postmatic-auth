import Link from "next/link"

import { sanitizeFromUrl } from "@/action/helpers"
import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { LoginForm } from "@/components/auth/login-form"
import { LogoMark } from "@/components/auth/logo-mark"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Sign in | Postmatic",
}

type LoginPageProps = {
  searchParams: Promise<{
    from?: string | string[]
    email?: string | string[]
    registered?: string | string[]
    verified?: string | string[]
  }>
}

const asSingle = (value?: string | string[]): string =>
  typeof value === "string" ? value : ""

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams
  const from = sanitizeFromUrl(
    typeof query.from === "string" ? query.from : env.POSTMATIC_DEFAULT_FROM_URL
  )

  const email = asSingle(query.email)
  const registered = asSingle(query.registered) === "1"
  const verified = asSingle(query.verified) === "1"

  const notice = registered
    ? "Registrasi berhasil. Cek email untuk verifikasi akun sebelum login."
    : verified
      ? "Akun sudah terverifikasi. Silakan login."
      : ""

  return (
    <AuthShell>
      <div className="w-full max-w-[560px] space-y-3">
        <Card className="w-full rounded-[22px] border-0 bg-white/95 py-0 shadow-lg ring-1 ring-[#dbe2ef]">
          <CardContent className="space-y-6 px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex justify-center">
              <LogoMark
                className="gap-2"
                badgeClassName="size-10 bg-[#3252e1] ring-[#3252e1]"
                textClassName="text-2xl text-[#111a2c]"
              />
            </div>

            <div className="space-y-1 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-[#101a2d]">
                Sign in to Postmatic
              </h1>
              <p className="text-base text-[#667085]">Use your email to continue</p>
            </div>

            <LoginForm
              from={from}
              initialEmail={email}
              notice={notice}
              focusPassword={registered || verified}
            />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-[#7e8595]">
          <Link href="#" className="hover:underline">
            Cookie Policy
          </Link>{" "}
          |{" "}
          <Link href="#" className="hover:underline">
            Data Deletion
          </Link>{" "}
          |{" "}
          <Link href="#" className="hover:underline">
            Privacy Policy
          </Link>{" "}
          |{" "}
          <Link href="#" className="hover:underline">
            Terms of Service
          </Link>
        </p>
      </div>
    </AuthShell>
  )
}
