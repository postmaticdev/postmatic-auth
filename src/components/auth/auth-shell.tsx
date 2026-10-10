import type { CSSProperties, ReactNode } from "react"
import Image from "next/image"
import {
  BookOpen,
  Link2,
  Lock,
  Repeat2,
  ShieldCheck,
  Users,
  Calendar,
} from "lucide-react"

import { cn } from "@/lib/utils"

type AuthShellVariant =
  | "login"
  | "signup"
  | "forgot-password"
  | "invite-member"
  | "social-platform"

type AuthShellProps = {
  children: ReactNode
  formPanelClassName?: string
  variant?: AuthShellVariant
}

const variantContent: Record<
  AuthShellVariant,
  {
    pill?: string
    heading: string
    subtext: string
    steps?: { id: number; title: string; active?: boolean }[]
    cards?: { icon: ReactNode; title: string; description: string }[]
  }
> = {
  login: {
    heading: "Welcome back.",
    subtext:
      "Securely sign in to access your dashboard, campaigns, and analytics.",
    cards: [
      {
        icon: <BookOpen className="h-5 w-5 text-white" />,
        title: "One Time Input Knowledge",
        description: "Just input your knowledge once",
      },
      {
        icon: <Calendar className="h-5 w-5 text-white" />,
        title: "Schedule",
        description: "Plan and schedule your content easily",
      },
      {
        icon: <Repeat2 className="h-5 w-5 text-white" />,
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
        icon: <BookOpen className="h-5 w-5 text-white" />,
        title: "One Time Input Knowledge",
        description: "Just input your knowledge once",
      },
      {
        icon: <Calendar className="h-5 w-5 text-white" />,
        title: "Schedule",
        description: "Plan and schedule your content easily",
      },
      {
        icon: <Repeat2 className="h-5 w-5 text-white" />,
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
        icon: <ShieldCheck className="h-5 w-5 text-white" />,
        title: "Privacy",
        description: "We never share your email address.",
      },
      {
        icon: <Lock className="h-5 w-5 text-white" />,
        title: "Security",
        description: "The reset link is valid for a limited time.",
      },
    ],
  },
  "invite-member": {
    heading: "Business invitation.",
    subtext:
      "Review your workspace invitation details and decide whether to join or decline.",
    cards: [
      {
        icon: <Users className="h-5 w-5 text-white" />,
        title: "Team Access",
        description: "Join your invited business workspace securely.",
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-white" />,
        title: "Trusted Flow",
        description: "Invitation links are validated before confirmation.",
      },
    ],
  },
  "social-platform": {
    heading: "Connect social platform.",
    subtext:
      "Review the account information and continue only if you trust this connection request.",
    cards: [
      {
        icon: <Link2 className="h-5 w-5 text-white" />,
        title: "Secure Linking",
        description: "Only approved social accounts will be connected.",
      },
      {
        icon: <ShieldCheck className="h-5 w-5 text-white" />,
        title: "Permission Aware",
        description: "Scopes are checked before finalizing the integration.",
      },
    ],
  },
}

export function AuthShell({
  children,
  formPanelClassName,
  variant = "login",
}: AuthShellProps) {
  const content = variantContent[variant]

  return (
    <main className="flex min-h-screen bg-white">
      {/* Left Sticky Panel */}
      <aside className="sticky top-0 hidden h-screen w-[60%] p-4 lg:block xl:w-[60%]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 p-10 xl:p-12">
          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <Image
              src="/logowhite.png"
              alt="Postmatic"
              width={32}
              height={32}
              className="h-8 w-8"
            />
            <span className="text-lg font-medium tracking-tight text-white">
              Postmatic
            </span>
          </div>

          {/* Grouped Content and Cards */}
          <div className="relative z-10 mt-auto flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              {content.pill && (
                <div className="w-fit rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                  {content.pill}
                </div>
              )}
              <div>
                <h1 className="max-w-md text-4xl font-semibold leading-tight text-white xl:text-5xl">
                  {content.heading}
                </h1>
                <p className="mt-3 max-w-md text-base leading-relaxed text-white/90">
                  {content.subtext}
                </p>
              </div>
            </div>

            {/* Cards or Steps */}
            <div>
              {content.steps ? (
                <div className="grid grid-cols-3 gap-3">
                  {content.steps.map((step) => (
                    <div
                      key={step.id}
                      className={cn(
                        "flex flex-col justify-between rounded-3xl p-5 shadow-sm transition-all",
                        step.active
                          ? "bg-white text-gray-900"
                          : "bg-white/10 text-white backdrop-blur-md border border-white/20"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                          step.active
                            ? "bg-blue-600 text-white"
                            : "bg-white/20 text-white"
                        )}
                      >
                        {step.id}
                      </div>
                      <p
                        className={cn(
                          "mt-8 text-sm font-medium leading-snug",
                          step.active ? "text-gray-900" : "text-white/90"
                        )}
                      >
                        {step.title}
                      </p>
                    </div>
                  ))}
                </div>
              ) : content.cards ? (
                <div className="grid gap-3 xl:grid-cols-3">
                  {content.cards.map((card) => (
                    <article
                      key={card.title}
                      className="flex items-start gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
                    >
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white/15">
                        {card.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-snug text-white">
                          {card.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-white/75">
                          {card.description}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>

            <p className="mt-2 text-xs text-white/60">
              &copy; {new Date().getFullYear()} Postmatic. All rights reserved.
            </p>
          </div>
        </div>
      </aside>

      {/* Right Form Panel */}
      <section
        className={cn(
          "flex min-h-screen flex-1 items-center justify-center bg-white p-8 sm:p-12 lg:p-16",
          formPanelClassName
        )}
      >
        {children}
      </section>
    </main>
  )
}
