import { cn } from "@/lib/utils"

type LogoMarkProps = {
  className?: string
  badgeClassName?: string
  textClassName?: string
}

export function LogoMark({
  className,
  badgeClassName,
  textClassName,
}: LogoMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "flex size-10 items-center justify-center rounded-xl bg-white/12 text-white shadow-sm ring-1 ring-white/20",
          badgeClassName
        )}
      >
        <span className="text-xl font-bold tracking-tight">P</span>
      </div>
      <span className={cn("text-2xl font-semibold text-white", textClassName)}>
        Postmatic
      </span>
    </div>
  )
}
