import type { ReactNode } from "react"
import Image from "next/image"
import { BookOpen, Lock, Repeat2, ShieldCheck } from "lucide-react"

import { cn } from "@/lib/utils"

type AuthShellVariant = "login" | "signup" | "forgot-password"

type AuthShellProps = {
  children: ReactNode
  rightPanelClassName?: string
  variant?: AuthShellVariant
}

const variantContent: Record<
  AuthShellVariant,
  {
    heading: string
    subtext: string
    cards: { icon: ReactNode; title: string; description: string }[]
  }
> = {
  login: {
    heading: "Welcome back.",
    subtext:
      "Securely sign in to access your dashboard, campaigns, and analytics.",
    cards: [
      {
        icon: <BookOpen className="h-5 w-5 text-blue-300" />,
        title: "One Time Input Knowledge",
        description: "Just input your knowledge once",
      },
      {
        icon: <Repeat2 className="h-5 w-5 text-blue-300" />,
        title: "Automate your social media",
        description: "Let it run automatically forever",
      },
    ],
  },
  signup: {
    heading: "Create your account.",
    subtext: "Join Postmatic to start a campaign and gain insights.",
    cards: [
      {
        icon: <BookOpen className="h-5 w-5 text-blue-300" />,
        title: "One Time Input Knowledge",
        description: "Just input your knowledge once",
      },
      {
        icon: <Repeat2 className="h-5 w-5 text-blue-300" />,
        title: "Automate your social media",
        description: "Let it run automatically forever",
      },
    ],
  },
  "forgot-password": {
    heading: "Reset your password.",
    subtext:
      "Enter your registered email address and we will send you a secure password reset link.",
    cards: [
      {
        icon: <ShieldCheck className="h-5 w-5 text-blue-300" />,
        title: "Privacy",
        description: "We never share your email address.",
      },
      {
        icon: <Lock className="h-5 w-5 text-blue-300" />,
        title: "Security",
        description: "The reset link is valid for a limited time.",
      },
    ],
  },
}

export function AuthShell({
  children,
  rightPanelClassName,
  variant = "login",
}: AuthShellProps) {
  const { heading, subtext, cards } = variantContent[variant]

  return (
    <main className="flex min-h-screen">
      <section className="relative hidden min-h-screen w-[45%] flex-col overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 lg:flex xl:w-[42%]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-80px] top-[-80px] h-[320px] w-[320px] rounded-full bg-blue-700/20 blur-3xl" />
          <div className="absolute bottom-[-60px] right-[-60px] h-[280px] w-[280px] rounded-full bg-sky-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col px-10 py-10 xl:px-14">
          <div className="mb-10 flex items-center gap-3">
            <Image
              src="/logofull.png"
              alt="Postmatic"
              width={40}
              height={40}
              className="h-10 w-10 rounded-lg"
            />
            <span className="text-xl font-bold tracking-tight text-white">Postmatic</span>
          </div>

          <div className="py-16">
            <h1 className="mb-4 text-3xl leading-tight font-bold text-white xl:text-4xl">
              {heading}
            </h1>
            <p className="max-w-sm text-base leading-relaxed text-blue-200/80 xl:text-lg">
              {subtext}
            </p>
          </div>

          <div className="mb-auto space-y-4">
            {cards.map((card) => (
              <article
                key={card.title}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm transition-colors duration-200 hover:bg-white/8"
              >
                <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/20">
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm leading-snug font-semibold text-white">{card.title}</p>
                  <p className="mt-0.5 text-sm text-blue-200/70">{card.description}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 border-t border-white/10 pt-10">
            <p className="text-xs text-blue-300/50">
              &copy; {new Date().getFullYear()} Postmatic. All rights reserved.
            </p>
          </div>
        </div>
      </section>

      <section
        className={cn(
          "flex min-h-screen flex-1 items-center justify-center bg-white px-6 py-12",
          rightPanelClassName
        )}
      >
        {children}
      </section>
    </main>
  )
}
