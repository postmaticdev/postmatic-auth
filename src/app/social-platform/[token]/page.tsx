import Image from "next/image"
import { redirect } from "next/navigation"

import {
  getSocialPlatformCallbackFailureStatus,
  getSocialPlatformPendingStatus,
} from "@/action"
import { buildAuthPageUrl, sanitizeFromUrl } from "@/action/helpers"
import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { SocialPlatformForm } from "@/components/auth/social-platform-form"

export const metadata = {
  title: "Connect social platform | Postmatic",
}

type SocialPlatformPageProps = {
  params: Promise<{ token: string }>
  searchParams: Promise<{
    from?: string | string[]
    connectedPlatformStatus?: string | string[]
    connectedPlatformError?: string | string[]
  }>
}

// Hanya kode error API (huruf besar dan underscore) yang ditampilkan dari query.
const CALLBACK_ERROR_CODE_PATTERN = /^[A-Z_]{1,80}$/

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

  // Callback OAuth gagal sebelum kode koneksi dibuat: tampilkan errornya, lalu
  // user mulai ulang dari workspace (login dulu bila perlu).
  const callbackFailed =
    query.connectedPlatformStatus === "failed" ||
    query.connectedPlatformStatus === "cancelled"
  const callbackError =
    typeof query.connectedPlatformError === "string" &&
    CALLBACK_ERROR_CODE_PATTERN.test(query.connectedPlatformError)
      ? query.connectedPlatformError
      : undefined

  const status = callbackFailed
    ? await getSocialPlatformCallbackFailureStatus(callbackError)
    : await getSocialPlatformPendingStatus(token)

  // Konfirmasi koneksi wajib login sebagai akun yang memulai koneksi. Setelah
  // login, user kembali ke halaman ini (kode koneksi masih berlaku singkat), atau
  // ke workspace bila callback gagal karena koneksi harus dimulai ulang.
  const pageUrl = callbackFailed
    ? from
    : buildAuthPageUrl(
        `/social-platform/${encodeURIComponent(token)}?from=${encodeURIComponent(from)}`
      )
  const loginUrl = `/login?from=${encodeURIComponent(pageUrl)}`

  if (status.code === "MISSING_TOKEN") {
    redirect(loginUrl)
  }

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

        <SocialPlatformForm from={from} status={status} loginUrl={loginUrl} />
      </div>
    </AuthShell>
  )
}
