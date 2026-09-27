import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted-foreground/20 dark:bg-muted-foreground/30 border border-border/20 shadow-2xs shrink-0",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

