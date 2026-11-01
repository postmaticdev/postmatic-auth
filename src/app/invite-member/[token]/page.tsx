import Image from "next/image"

import { getInviteMemberStatus } from "@/action"
import { getSessionEmail } from "@/action/cookies"
import { buildAuthPageUrl } from "@/action/helpers"
import { AuthShell } from "@/components/auth/auth-shell"
import { InviteMemberForm } from "@/components/auth/invite-member-form"

export const metadata = {
  title: "Invite member | Postmatic",
}

type InviteMemberPageProps = {
  params: Promise<{ token: string }>
}

export default async function InviteMemberPage({ params }: InviteMemberPageProps) {
  const routeParams = await params
  const token = routeParams.token

  const status = await getInviteMemberStatus(token)
  const signedInEmail = await getSessionEmail()
  // Tujuan kembali setelah login/daftar, agar user bisa langsung menerima undangan.
  const inviteUrl = buildAuthPageUrl(`/invite-member/${encodeURIComponent(token)}`)

  return (
    <AuthShell variant="invite-member">
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

          <h2 className="mb-1 text-2xl font-bold text-gray-900">Business invitation</h2>
          <p className="text-sm text-gray-500">
            Review detail undangan workspace sebelum Anda mengambil keputusan.
          </p>
        </div>

        <InviteMemberForm
          token={token}
          status={status}
          inviteUrl={inviteUrl}
          signedInEmail={signedInEmail}
        />
      </div>
    </AuthShell>
  )
}
