import Image from "next/image"

import { getForgotPasswordTokenStatus } from "@/action"
import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordResetForm } from "@/components/auth/forgot-password-reset-form"

export const metadata = {
  title: "Reset password | Postmatic",
}

type ForgotPasswordTokenPageProps = {
  params: Promise<{ token: string }>
}

export default async function ForgotPasswordTokenPage({
  params,
}: ForgotPasswordTokenPageProps) {
  const routeParams = await params
  const token = routeParams.token

  const status = await getForgotPasswordTokenStatus(token)

  return (
    <AuthShell variant="forgot-password">
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
          <h2 className="mb-1 text-2xl font-bold text-gray-900">Reset password</h2>
          <p className="text-sm leading-relaxed text-gray-500">
            Create a new password to continue using your Postmatic account.
          </p>
        </div>

        <ForgotPasswordResetForm token={token} status={status} />
      </div>
    </AuthShell>
  )
}
