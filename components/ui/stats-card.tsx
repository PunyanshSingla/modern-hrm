
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  className?: string;
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
  trend
}: StatsCardProps) {
  return (
    <Card className={cn(
      "rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300 group",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-black tracking-tight">{value}</div>
          {trend && (
            <div className={cn(
              "flex items-center text-[10px] font-black px-1.5 py-0.5 rounded-full",
              trend.isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
            )}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </div>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground font-medium mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
