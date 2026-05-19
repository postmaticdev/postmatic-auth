"use client"

import { useActionState, useMemo, useState } from "react"
import Link from "next/link"
import { Building2, Globe, Mail, ShieldCheck, UserRound } from "lucide-react"

import {
  connectSocialPlatformAction,
  initialActionState,
} from "@/action"
import { FormMessage } from "@/components/auth/form-message"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

import type { SocialPlatformPendingStatusResult } from "@/action/social-platform"
import type { SocialPlatformAccountPayload } from "@/action/types"

type SocialPlatformFormProps = {
  from: string
  status: SocialPlatformPendingStatusResult
}

const toTitleCase = (value: string): string =>
  value
    .split("_")
    .filter(Boolean)
    .map((chunk) => `${chunk.charAt(0).toUpperCase()}${chunk.slice(1).toLowerCase()}`)
    .join(" ")

const getSafeUrl = (value?: string | null): string | null => {
  if (!value) {
    return null
  }

  try {
    const parsed = new URL(value)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return parsed.toString()
    }
    return null
  } catch {
    return null
  }
}

const renderAccountAvatar = (account: SocialPlatformAccountPayload) => {
  const iconUrl = getSafeUrl(account.platformIconUrl)

  if (!iconUrl) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
        <UserRound className="h-5 w-5 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
      <div
        className="h-full w-full bg-cover bg-center"
        role="img"
        aria-label={`Avatar ${account.platformUserName}`}
        style={{ backgroundImage: `url('${iconUrl}')` }}
      />
    </div>
  )
}

export function SocialPlatformForm({ from, status }: SocialPlatformFormProps) {
  const pendingData = status.data
  const accounts = pendingData?.accounts ?? []
  const defaultSelectedAccount =
    accounts.length === 1 ? accounts[0]?.tempCodeAccount ?? "" : ""

  const [selectedAccount, setSelectedAccount] = useState(defaultSelectedAccount)
  const [submitState, submitAction, submitPending] = useActionState(
    connectSocialPlatformAction,
    initialActionState
  )

  const businessLogo = useMemo(
    () => getSafeUrl(pendingData?.business.primaryLogoUrl),
    [pendingData?.business.primaryLogoUrl]
  )

  if (!status.valid || !pendingData) {
    return (
      <div className="space-y-5">
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
          <AlertTitle>Koneksi platform tidak tersedia</AlertTitle>
          <AlertDescription>{status.message}</AlertDescription>
        </Alert>

        <p className="text-center text-sm text-gray-500">
          <Link
            href={from}
            className="font-semibold text-blue-600 transition-colors hover:text-blue-700"
          >
            Kembali ke halaman sebelumnya
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Alert className="border-blue-100 bg-blue-50 text-blue-900">
        <AlertTitle>Konfirmasi koneksi akun</AlertTitle>
        <AlertDescription>
          Pastikan akun yang Anda pilih memang ingin dihubungkan ke workspace ini.
        </AlertDescription>
      </Alert>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {businessLogo ? (
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url('${businessLogo}')` }}
                role="img"
                aria-label={`Logo ${pendingData.business.name}`}
              />
            ) : (
              <Building2 className="h-5 w-5 text-gray-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-gray-900">
              {pendingData.business.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {toTitleCase(pendingData.platformCode)}
              </Badge>
              {pendingData.business.category ? (
                <Badge variant="outline">{pendingData.business.category}</Badge>
              ) : null}
            </div>
          </div>
        </div>

        {pendingData.business.websiteUrl ? (
          <>
            <Separator className="my-4" />
            <p className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4 text-gray-400" />
              <a
                href={pendingData.business.websiteUrl}
                target="_blank"
                rel="noreferrer"
                className="truncate text-blue-600 hover:text-blue-700 hover:underline"
              >
                {pendingData.business.websiteUrl}
              </a>
            </p>
          </>
        ) : null}
      </div>

      <form action={submitAction} className="space-y-4">
        <input type="hidden" name="from" value={from} readOnly />
        <input
          type="hidden"
          name="businessRootId"
          value={pendingData.business.businessRootId}
          readOnly
        />
        <input type="hidden" name="tempCodeAccount" value={selectedAccount} readOnly />

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-900">
              Pilih akun {toTitleCase(pendingData.platformCode)}
            </p>
            {pendingData.selectionRequired ? (
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                Wajib pilih satu
              </Badge>
            ) : null}
          </div>

          {accounts.length === 0 ? (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
              <AlertTitle>Akun platform tidak ditemukan</AlertTitle>
              <AlertDescription>
                Temp code akun tidak tersedia untuk dikoneksikan.
              </AlertDescription>
            </Alert>
          ) : (
            <RadioGroup
              name="tempCodeAccountChooser"
              value={selectedAccount}
              onValueChange={setSelectedAccount}
              className="gap-2"
            >
              {accounts.map((account) => (
                <Label
                  key={account.tempCodeAccount}
                  htmlFor={account.tempCodeAccount}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-3 transition-colors",
                    selectedAccount === account.tempCodeAccount
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <RadioGroupItem
                    id={account.tempCodeAccount}
                    value={account.tempCodeAccount}
                    className="mt-1"
                  />

                  {renderAccountAvatar(account)}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {account.platformUserName}
                    </p>
                    <p className="truncate text-xs text-gray-500">{account.platformUserId}</p>
                    {account.platformUserEmail ? (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-gray-500">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {account.platformUserEmail}
                      </p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {account.platformScopes.slice(0, 5).map((scope) => (
                        <Badge key={scope} variant="outline" className="text-[10px]">
                          {scope}
                        </Badge>
                      ))}
                      {account.platformScopes.length > 5 ? (
                        <Badge variant="outline" className="text-[10px]">
                          +{account.platformScopes.length - 5}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          )}
        </div>

        <FormMessage state={submitState} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitPending}
            asChild
            className="h-auto py-3 text-sm font-semibold"
          >
            <Link href={from}>Batal</Link>
          </Button>

          <Button
            type="submit"
            disabled={submitPending || !selectedAccount}
            className="h-auto bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {submitPending ? "Menghubungkan..." : "Ya, hubungkan akun"}
          </Button>
        </div>
      </form>

      <p className="flex items-start gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        Pastikan Anda hanya menghubungkan akun yang memang Anda miliki atau kelola.
      </p>
    </div>
  )
}
