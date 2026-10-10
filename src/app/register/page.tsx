import Image from "next/image"

import { sanitizeFromUrl } from "@/action/helpers"
import { env } from "@/constants"
import { AuthShell } from "@/components/auth/auth-shell"
import { RegisterForm } from "@/components/auth/register-form"

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
    <AuthShell variant="signup">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center justify-center text-center">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <Image
              src="/logofull.png"
              alt="Postmatic"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg"
            />
          </div>

          <h2 className="mb-1 text-2xl font-bold text-gray-900">Create an account</h2>
          <p className="text-sm text-gray-500">
            Start your journey with Postmatic today.
          </p>
        </div>

        <RegisterForm from={from} />
      </div>
    </AuthShell>
  )
}
