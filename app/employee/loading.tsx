import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function EmployeeLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Skeleton */}
      <div className="border-b border-border/60 pb-6 space-y-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded-md" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border border-border/60 p-5 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-xl border border-border/60 p-6 space-y-4">
            <Skeleton className="h-6 w-48 rounded" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </Card>
          <Card className="rounded-xl border border-border/60 p-6 space-y-4">
            <Skeleton className="h-6 w-36 rounded" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </Card>
        </div>
        <div className="lg:col-span-3 space-y-6">
          <Card className="rounded-xl border border-border/60 p-6 space-y-4">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </Card>
        </div>
      </div>
    </div>
  )
}
