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
        <div className="mb-6 flex justify-center lg:hidden">
          <Image
            src="/logofull.png"
            alt="Postmatic"
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg"
          />
        </div>

        {/* Judul halaman dirender di dalam form agar state sukses bisa menggantikannya */}
        <ForgotPasswordRequestForm />
      </div>
    </AuthShell>
  )
}
