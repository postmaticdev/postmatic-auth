import Image from "next/image"
import Link from "next/link"
import { AlertCircle, CheckCircle2 } from "lucide-react"

import { getGoogleConnectCredentialsStateStatus } from "@/action"
import { AuthShell } from "@/components/auth/auth-shell"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Google credentials connection | Postmatic",
}

type ConnectGoogleWithCredentialsPageProps = {
  params: Promise<{ token: string }>
}

const toReadable = (value: string): string =>
  value
    .split("_")
    .filter(Boolean)
    .map((chunk) => `${chunk.charAt(0).toUpperCase()}${chunk.slice(1).toLowerCase()}`)
    .join(" ")

export default async function ConnectGoogleWithCredentialsPage({
  params,
}: ConnectGoogleWithCredentialsPageProps) {
  const routeParams = await params
  const token = routeParams.token
  const status = await getGoogleConnectCredentialsStateStatus(token)

  const isSuccess =
    status.valid &&
    (status.status.toLowerCase() === "success" ||
      status.status.toLowerCase() === "connected")

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

          <h2 className="mb-1 text-2xl font-bold text-gray-900">
            Google connection result
          </h2>
          <p className="text-sm text-gray-500">
            Hasil proses menghubungkan akun credentials ke akun Google Anda.
          </p>
        </div>

        <div className="space-y-4">
          <Alert
            className={
              isSuccess
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-700"
            }
            variant={isSuccess ? "default" : "destructive"}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{isSuccess ? "Koneksi berhasil" : "Koneksi gagal"}</AlertTitle>
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">State: {toReadable(status.status)}</Badge>
              {status.code ? (
                <Badge variant="outline">Code: {toReadable(status.code)}</Badge>
              ) : null}
            </div>
          </div>

          <Button asChild className="h-11 sm:h-10 w-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700">
            <Link href={status.from}>Kembali ke aplikasi</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
