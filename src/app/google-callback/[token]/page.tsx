import Image from "next/image"

import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { GoogleCallbackConsumeForm } from "@/components/auth/google-callback-consume-form"

export const metadata = {
  title: "Google callback | Postmatic",
}

type GoogleCallbackPageProps = {
  params: Promise<{ token: string }>
}

export default async function GoogleCallbackPage({
  params,
}: GoogleCallbackPageProps) {
  const routeParams = await params
  const token = routeParams.token

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

          <h2 className="mb-1 text-2xl font-bold text-gray-900">Google sign in</h2>
          <p className="text-sm text-gray-500">
            Kami sedang menyelesaikan proses login Google Anda.
          </p>
        </div>

        <GoogleCallbackConsumeForm
          token={token}
          fallbackFrom={env.POSTMATIC_DEFAULT_FROM_URL}
        />
      </div>
    </AuthShell>
  )
}
