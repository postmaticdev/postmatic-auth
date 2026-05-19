import Image from "next/image"

import { getSocialPlatformPendingStatus } from "@/action"
import { sanitizeFromUrl } from "@/action/helpers"
import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { SocialPlatformForm } from "@/components/auth/social-platform-form"

export const metadata = {
  title: "Connect social platform | Postmatic",
}

type SocialPlatformPageProps = {
  params: Promise<{ token: string }>
  searchParams: Promise<{ from?: string | string[] }>
}

export default async function SocialPlatformPage({
  params,
  searchParams,
}: SocialPlatformPageProps) {
  const routeParams = await params
  const query = await searchParams

  const token = routeParams.token
  const from = sanitizeFromUrl(
    typeof query.from === "string" ? query.from : env.POSTMATIC_DEFAULT_FROM_URL
  )

  const status = await getSocialPlatformPendingStatus(token)

  return (
    <AuthShell variant="social-platform">
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

          <h2 className="mb-1 text-2xl font-bold text-gray-900">Connect social platform</h2>
          <p className="text-sm text-gray-500">
            Tinjau detail akun dan lanjutkan jika Anda yakin ingin menghubungkannya.
          </p>
        </div>

        <SocialPlatformForm from={from} status={status} />
      </div>
    </AuthShell>
  )
}
