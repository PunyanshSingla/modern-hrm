"use client";
import { useState, useEffect } from "react";
import { AttendanceMarker } from "@/components/attendance-marker";
import { LeaveRequestWidget } from "@/components/leave-request-widget";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client"; 
import { StatsCard } from "@/components/ui/stats-card";
import { Calendar, Clock, Activity, ArrowRight, User as UserIcon, Megaphone, CalendarHeart, Banknote, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, isAfter, startOfToday } from "date-fns";
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

export default function EmployeeDashboard() {
  const { data: session } = authClient.useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [pay, setPay] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, holRes, payRes] = await Promise.all([
          fetch("/api/employee/announcements"),
          fetch("/api/employee/holidays"),
          fetch("/api/employee/pay")
        ]);
        
        const [annData, holData, payData] = await Promise.all([
          annRes.json(),
          holRes.json(),
          payRes.json()
        ]);

        if (annData.success) setAnnouncements(annData.announcements.slice(0, 3));
        if (holData.success) setHolidays(holData.holidays.filter((h: any) => isAfter(new Date(h.date), startOfToday())).slice(0, 2));
        if (payData.success) setPay(payData.profile);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
            <Activity className="h-3 w-3 mr-2" /> Personal Portal
          </Badge>
          <h1 className="text-4xl font-black tracking-tight uppercase">
            Welcome back, <span className="text-primary italic">{session?.user?.name?.split(' ')[0] || 'Employee'}!</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Stay updated with company announcements and your schedule.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Salary"
          value={pay ? `₹ ${pay.baseSalary.toLocaleString()}` : "---"}
          description="Monthly base amount"
          icon={Banknote}
          className="bg-primary/5 border-primary/10 transition-all hover:scale-105"
        />
        <StatsCard
          title="Announcements"
          value={announcements.length}
          description="Recent updates"
          icon={Bell}
        />
        <StatsCard
          title="Upcoming Holiday"
          value={holidays[0] ? format(new Date(holidays[0].date), "MMM d") : "---"}
          description={holidays[0]?.name || "None scheduled"}
          icon={CalendarHeart}
        />
        <StatsCard
          title="Attendance"
          value="Good"
          description="Consistency index"
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Main Content Area */}
        <div className="lg:col-span-4 space-y-6">
            <AttendanceMarker />
            
            {/* Announcements Feed */}
            <Card className="rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold italic uppercase tracking-tight flex items-center gap-2">
                            <Megaphone className="h-5 w-5 text-primary" /> Official Broadcasts
                        </CardTitle>
                        <CardDescription>Latest updates from the management</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="rounded-xl font-bold text-xs uppercase text-primary">
                        <Link href="/employee/announcements">View All</Link>
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {announcements.length > 0 ? (
                        announcements.map((ann, idx) => (
                            <div key={ann._id} className={cn(
                                "p-4 rounded-2xl border bg-background/50 hover:bg-background/80 transition-all",
                                ann.priority === 'High' ? "border-rose-500/20 bg-rose-500/5" : "border-border/50"
                            )}>
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <h4 className="font-black uppercase tracking-tight text-sm">{ann.title}</h4>
                                    <Badge variant="secondary" className={cn(
                                        "text-[8px] font-black uppercase tracking-tighter px-2",
                                        ann.priority === 'High' ? "bg-rose-500 text-white" : "bg-muted"
                                    )}>{ann.priority}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 italic font-medium">"{ann.content}"</p>
                                <p className="text-[9px] text-muted-foreground/50 font-bold uppercase mt-2">{format(new Date(ann.createdAt), "MMMM d, h:mm a")}</p>
                            </div>
                        ))
                    ) : (
                        <div className="py-10 text-center border-2 border-dashed rounded-2xl">
                            <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-10" />
                            <p className="text-xs font-bold italic text-muted-foreground">No recent broadcasts.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-3 space-y-6"> 
            <LeaveRequestWidget />

            {/* Upcoming Holidays Widget */}
            <Card className="rounded-3xl border-muted-foreground/10 bg-muted/20 backdrop-blur-sm shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <CalendarHeart className="h-5 w-5 text-primary" /> Holiday Radar
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {holidays.length > 0 ? (
                        holidays.map((hol) => (
                            <div key={hol._id} className="flex items-center justify-between p-3 rounded-xl bg-background/40 border border-border/50 group hover:border-primary/50 transition-colors">
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold uppercase tracking-tight leading-tight">{hol.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-black uppercase">{format(new Date(hol.date), "EEEE")}</span>
                                </div>
                                <Badge variant="outline" className="h-10 w-10 p-0 flex flex-col items-center justify-center rounded-lg border-2 bg-primary/5 text-primary font-black">
                                    <span className="text-[10px] leading-none opacity-60 uppercase">{format(new Date(hol.date), "MMM")}</span>
                                    <span className="text-lg leading-none">{format(new Date(hol.date), "d")}</span>
                                </Badge>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-center text-muted-foreground font-medium italic py-6">No holidays in the next 30 days.</p>
                    )}
                    <Button variant="outline" className="w-full h-10 rounded-xl font-bold uppercase tracking-tight text-xs mt-2" asChild>
                        <Link href="/employee/holidays">Full Calendar <ArrowRight className="ml-2 h-3 w-3" /></Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
