import { redirect } from "next/navigation"

import { getVerifyTokenStatus } from "@/action"
import { sanitizeFromUrl } from "@/action/helpers"
import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { LogoMark } from "@/components/auth/logo-mark"
import { VerifyAccountForm } from "@/components/auth/verify-account-form"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Verify account | Postmatic",
}

type VerifyAccountPageProps = {
  params: Promise<{ token: string }>
  searchParams: Promise<{ from?: string | string[] }>
}

export default async function VerifyAccountPage({
  params,
  searchParams,
}: VerifyAccountPageProps) {
  const routeParams = await params
  const query = await searchParams

  const token = routeParams.token
  const from = sanitizeFromUrl(
    typeof query.from === "string" ? query.from : env.POSTMATIC_DEFAULT_FROM_URL
  )

  const status = await getVerifyTokenStatus(token)

  if (status.code === "USER_ALREADY_VERIFIED") {
    redirect(
      `/login?verified=1&email=${encodeURIComponent(status.email ?? "")}&from=${encodeURIComponent(from)}`
    )
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-[560px] rounded-[22px] border-0 bg-white/95 py-0 shadow-lg ring-1 ring-[#dbe2ef]">
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
              Verify your account
            </h1>
            <p className="text-base text-[#667085]">
              Validate your verification link and continue to Postmatic dashboard.
            </p>
          </div>

          <VerifyAccountForm token={token} from={from} status={status} />
        </CardContent>
      </Card>
    </AuthShell>
  )
}
