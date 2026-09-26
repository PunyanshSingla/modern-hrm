
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  href?: string;
  loading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  href,
  loading = false,
  trend
}: StatsCardProps) {
  const content = (
    <Card className={cn(
      "rounded-2xl border border-border/60 bg-card p-5 hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md group relative overflow-hidden",
      href && "cursor-pointer",
      className
    )}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          {title}
        </span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105 shrink-0">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        {loading ? (
          <Skeleton className="h-8 w-24 rounded-lg opacity-60" />
        ) : (
          <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
        )}
        {!loading && trend && (
          <div className={cn(
            "flex items-center text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
            trend.isPositive 
              ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400" 
              : "text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400"
          )}>
            {trend.isPositive ? "+" : "-"}{trend.value}%
          </div>
        )}
      </div>

      {description && (
        loading ? (
          <Skeleton className="h-3.5 w-32 mt-2 rounded-full opacity-40" />
        ) : (
          <p className="text-xs text-muted-foreground mt-1.5 font-medium">
            {description}
          </p>
        )
      )}
    </Card>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}


