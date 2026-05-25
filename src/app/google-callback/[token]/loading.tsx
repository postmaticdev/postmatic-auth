import Image from "next/image"
import { LoaderCircle } from "lucide-react"

import { AuthShell } from "@/components/auth/auth-shell"

export default function GoogleCallbackLoading() {
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
            Menyiapkan proses autentikasi Google Anda.
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-900">
          <div className="flex items-center gap-2">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            <p className="text-sm font-medium">Loading callback data...</p>
          </div>
        </div>
      </div>
    </AuthShell>
  )
}
