import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28 rounded-md opacity-60" />
          <Skeleton className="h-8 w-56 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md opacity-40" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border border-border/60 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded-md opacity-60" />
              <Skeleton className="h-8 w-8 rounded-xl opacity-50" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg opacity-70" />
            <Skeleton className="h-3 w-36 rounded-md opacity-40" />
          </Card>
        ))}
      </div>

      {/* Main Table / Grid Skeleton Area */}
      <div className="space-y-4">
        {/* Controls skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Skeleton className="h-9 w-64 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>

        {/* Table skeleton */}
        <Card className="rounded-xl border border-border/60 p-4 space-y-4 bg-card">
          <div className="flex items-center justify-between border-b border-border/40 pb-3">
            <Skeleton className="h-4 w-32 rounded opacity-60" />
            <Skeleton className="h-4 w-24 rounded opacity-60" />
            <Skeleton className="h-4 w-28 rounded opacity-60" />
            <Skeleton className="h-4 w-20 rounded opacity-60" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full opacity-60" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-24 rounded opacity-50" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 rounded opacity-50" />
              <Skeleton className="h-6 w-20 rounded-full opacity-60" />
              <Skeleton className="h-8 w-8 rounded-lg opacity-40" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
