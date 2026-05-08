import { sanitizeFromUrl } from "@/action/helpers"
import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { LogoMark } from "@/components/auth/logo-mark"
import { RegisterForm } from "@/components/auth/register-form"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "Register | Postmatic",
}

type RegisterPageProps = {
  searchParams: Promise<{ from?: string | string[] }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const query = await searchParams
  const from = sanitizeFromUrl(
    typeof query.from === "string" ? query.from : env.POSTMATIC_DEFAULT_FROM_URL
  )

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
              Create Postmatic account
            </h1>
            <p className="text-base text-[#667085]">
              Register with your email and verify your account.
            </p>
          </div>

          <RegisterForm from={from} />
        </CardContent>
      </Card>
    </AuthShell>
  )
}
