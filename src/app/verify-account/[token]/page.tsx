import Image from "next/image"
import { redirect } from "next/navigation"

import { getVerifyTokenStatus } from "@/action"
import { sanitizeFromUrl } from "@/action/helpers"
import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { VerifyAccountForm } from "@/components/auth/verify-account-form"

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
    <AuthShell variant="login">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center lg:items-start lg:justify-start">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <Image
              src="/logofull.png"
              alt="Postmatic"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg"
            />
          </div>

          <h2 className="mb-1 text-2xl font-bold text-gray-900">Verify your account</h2>
          <p className="text-sm text-gray-500">
            Confirm your account status and continue securely.
          </p>
        </div>

        <VerifyAccountForm token={token} from={from} status={status} />
      </div>
    </AuthShell>
  )
}
