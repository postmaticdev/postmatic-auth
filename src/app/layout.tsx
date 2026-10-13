import type { Metadata } from "next"

import "./globals.css"

import { EnterToNextField } from "@/components/enter-to-next-field"

export const metadata: Metadata = {
  title: "Postmatic Auth",
  description: "Authentication frontend for Postmatic ecosystem",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <EnterToNextField />
        {children}
      </body>
    </html>
  )
}
