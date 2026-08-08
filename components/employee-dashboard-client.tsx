"use client"

import { AttendanceMarker } from "@/components/attendance-marker";
import { LeaveRequestWidget } from "@/components/leave-request-widget";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatsCard } from "@/components/ui/stats-card";
import { Activity, ArrowRight, Megaphone, CalendarHeart, Banknote, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

interface Holiday {
  _id: string;
  name: string;
  date: string;
}

interface EmployeeDashboardClientProps {
    initialData: {
        session: any
        announcements: Announcement[]
        holidays: Holiday[]
        pay: any
    }
}

export function EmployeeDashboardClient({ initialData }: EmployeeDashboardClientProps) {
  const { session, announcements, holidays, pay } = initialData;
  const firstName = session?.user?.name?.split(' ')[0] || 'Team Member';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="border-b border-border/60 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5" /> Employee Workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{firstName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Check company announcements, log your work shift, and manage time off.
          </p>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Monthly Salary"
          value={pay ? `₹${(pay.baseSalary || 0).toLocaleString()}` : "---"}
          description="Base pay statement"
          icon={Banknote}
          href="/employee/pay"
        />
        <StatsCard
          title="Announcements"
          value={announcements.length}
          description="Company updates"
          icon={Bell}
          href="/employee/announcements"
        />
        <StatsCard
          title="Upcoming Holiday"
          value={holidays[0] ? format(new Date(holidays[0].date), "MMM d") : "None"}
          description={holidays[0]?.name || "No upcoming holidays"}
          icon={CalendarHeart}
          href="/employee/holidays"
        />
        <StatsCard
          title="Attendance Score"
          value="98%"
          description="Good standing"
          icon={Activity}
          href="/employee/attendance"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Actions Area */}
        <div className="lg:col-span-4 space-y-6">
          <AttendanceMarker />
          
          {/* Company News Feed */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
            <CardHeader className="p-0 pb-3 border-b border-border/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" /> Company News
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mt-0.5">Latest broadcasts from leadership</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-medium px-2.5">
                <Link href="/employee/announcements">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-3">
              {announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann._id} className={cn(
                    "p-3.5 rounded-lg border space-y-1",
                    ann.priority === 'High' 
                      ? "border-rose-500/20 bg-rose-500/5 text-rose-800" 
                      : "border-border/60 bg-muted/30"
                  )}>
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="font-semibold text-xs text-foreground">{ann.title}</h4>
                      <Badge variant="outline" className={cn(
                        "text-xs font-medium px-2 py-0.5 border capitalize",
                        ann.priority === 'High' ? "bg-rose-500/10 text-rose-700 border-rose-500/20" : "bg-muted/60 text-muted-foreground border-border/50"
                      )}>{ann.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-normal line-clamp-2 leading-relaxed">{ann.content}</p>
                    <p className="text-[11px] text-muted-foreground/70 font-normal pt-0.5">
                      {format(new Date(ann.createdAt), "MMMM d, yyyy • h:mm a")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/60">
                  <p className="font-normal">No recent broadcasts published.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-3 space-y-6"> 
          <LeaveRequestWidget />

          {/* Upcoming Holidays Widget */}
          <Card className="rounded-xl border border-border bg-card p-5 shadow-xs relative overflow-hidden">
            <CardHeader className="p-0 pb-3 border-b border-border/60">
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CalendarHeart className="h-4 w-4 text-primary" /> Upcoming Holidays
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-4 space-y-3">
              {holidays.length > 0 ? (
                holidays.map((hol) => (
                  <div key={hol._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/60">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-xs font-semibold text-foreground leading-snug">{hol.name}</span>
                      <span className="text-[11px] text-muted-foreground font-normal">{format(new Date(hol.date), "EEEE")}</span>
                    </div>
                    <div className="h-9 w-9 flex flex-col items-center justify-center rounded-md bg-primary/10 text-primary font-semibold shrink-0">
                      <span className="text-[9px] uppercase leading-none opacity-80">{format(new Date(hol.date), "MMM")}</span>
                      <span className="text-xs leading-none mt-0.5">{format(new Date(hol.date), "d")}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center text-muted-foreground py-3">No scheduled holidays in the coming month.</p>
              )}
              <Button variant="outline" className="w-full h-9 rounded-lg font-medium text-xs shadow-xs gap-1.5" asChild>
                <Link href="/employee/holidays">View Holiday Calendar <ArrowRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
