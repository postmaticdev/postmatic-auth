import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { LogoMark } from "./logo-mark"

type AuthShellProps = {
  children: ReactNode
  rightPanelClassName?: string
}

const featureItems = [
  {
    title: "One Time Input Knowledge",
    description: "Just input your knowledge once",
  },
  {
    title: "Automate your social media",
    description: "Let it run automatically forever",
  },
]

export function AuthShell({ children, rightPanelClassName }: AuthShellProps) {
  return (
    <main className="flex min-h-screen bg-[#eef0f4]">
      <section className="relative hidden w-full max-w-[50%] flex-col justify-between overflow-hidden bg-gradient-to-b from-[#3252e1] via-[#3954e5] to-[#5a62ec] px-12 py-10 text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_48%)]" />

        <div className="relative z-10 space-y-10">
          <LogoMark textClassName="text-4xl" />

          <div className="space-y-4">
            <h1 className="text-5xl font-semibold leading-tight tracking-tight">
              Welcome back.
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-white/80">
              Securely sign in to access your dashboard, campaigns, and analytics.
            </p>
          </div>

          <div className="grid max-w-3xl grid-cols-2 gap-3">
            {featureItems.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl bg-white/10 px-5 py-4 backdrop-blur-sm"
              >
                <h2 className="text-lg font-semibold leading-tight">{item.title}</h2>
                <p className="mt-2 text-sm text-white/80">{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-white/70">
          &copy; {new Date().getFullYear()} Postmatic. All rights reserved.
        </p>
      </section>

      <section
        className={cn(
          "flex w-full flex-1 items-center justify-center px-5 py-6 sm:px-8 lg:px-12",
          rightPanelClassName
        )}
      >
        {children}
      </section>
    </main>
  )
}
