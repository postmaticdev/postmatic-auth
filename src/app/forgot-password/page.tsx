import Image from "next/image"

import { AuthShell } from "@/components/auth/auth-shell"
import { ForgotPasswordRequestForm } from "@/components/auth/forgot-password-request-form"

export const metadata = {
  title: "Forgot password | Postmatic",
}

export default function ForgotPasswordPage() {
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
          <h2 className="mb-1 text-2xl font-bold text-gray-900">Forgot password?</h2>
          <p className="text-sm leading-relaxed text-gray-500">
            No worries! Enter your email below and we will send you a secure reset link.
          </p>
        </div>

        <ForgotPasswordRequestForm />
      </div>
    </AuthShell>
  )
}
