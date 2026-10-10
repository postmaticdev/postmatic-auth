import Image from "next/image";
import Link from "next/link";

import { sanitizeFromUrl } from "@/action/helpers";
import { env } from "@/constants";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = {
  title: "Sign in | Postmatic",
};

type LoginPageProps = {
  searchParams: Promise<{
    from?: string | string[];
    email?: string | string[];
    registered?: string | string[];
    verified?: string | string[];
    reset?: string | string[];
  }>;
};

const asSingle = (value?: string | string[]): string =>
  typeof value === "string" ? value : "";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const from = sanitizeFromUrl(
    typeof query.from === "string"
      ? query.from
      : env.POSTMATIC_DEFAULT_FROM_URL,
  );

  const email = asSingle(query.email);
  const registered = asSingle(query.registered) === "1";
  const verified = asSingle(query.verified) === "1";
  const reset = asSingle(query.reset) === "1";

  const notice = reset
    ? "Password berhasil direset. Silakan login dengan password baru."
    : registered
      ? "Registrasi berhasil. Cek email untuk verifikasi akun sebelum login."
      : verified
        ? "Akun sudah terverifikasi. Silakan login."
        : "";

  return (
    <AuthShell variant="login">
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
          <h2 className="mb-1 text-2xl font-bold text-gray-900">Sign in</h2>
          <p className="text-sm text-gray-500">
            Welcome back! Please enter your details.
          </p>
        </div>

        <LoginForm
          from={from}
          initialEmail={email}
          notice={notice}
          focusPassword={registered || verified}
        />

      </div>
    </AuthShell>
  );
}
