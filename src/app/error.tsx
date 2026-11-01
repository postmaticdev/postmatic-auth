"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Terjadi kesalahan</h1>
        <p className="mb-8 text-sm text-gray-500">
          Halaman tidak dapat dimuat. Periksa koneksi Anda lalu coba lagi.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={reset}
            className="h-11 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-700 sm:h-10"
          >
            Coba lagi
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-xl px-6 font-semibold sm:h-10"
          >
            <Link href="/login">Kembali ke login</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
