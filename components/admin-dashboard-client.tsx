"use client"

import { 
  Users, 
  Briefcase,
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  Calendar,
  Activity,
  ArrowRight
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCard } from "@/components/ui/stats-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"

interface DashboardStats {
  totalEmployees: number
  totalDepartments: number
  totalProjects: number
  pendingLeaves: number
  pendingITRequests: number
  activeProjects: number
  todayAttendance: number
  tasks: {
    total: number
    pending: number
  }
  monthlyPayroll: number
  upcomingHoliday?: {
    name: string
    date: string
  }
  latestAnnouncement?: {
    title: string
    content: string
    createdAt: string
  }
}

interface RecentEmployee {
  _id: string
  firstName: string
  lastName: string
  position: string
  department: string
}

interface RecentTask {
  _id: string
  title: string
  status: string
  priority: string
  assigneeIds: { firstName: string; lastName: string }[]
}

interface AdminDashboardClientProps {
    initialData: {
        stats: DashboardStats
        recentEmployees: RecentEmployee[]
        recentTasks: RecentTask[]
    }
}

export function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const { stats, recentEmployees, recentTasks } = initialData;

  return (
    <div className="p-6 lg:p-10 space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
            <Activity className="h-3 w-3 mr-2" /> Live Analytics
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground">DASHBOARD</h1>
          <p className="text-muted-foreground font-medium">
            Welcome back, Admin. Here's what's happening today in your organization.
          </p>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Workforce"
              value={stats?.totalEmployees || 0}
              description="Total active employees"
              icon={Users}
              className="bg-gradient-to-br from-primary/10 to-transparent border-primary/10"
            />
            <StatsCard
              title="Today's Attendance"
              value={stats?.todayAttendance || 0}
              description="Clocked in today"
              icon={CheckCircle2}
              trend={{ value: 5, isPositive: true }}
            />
             <StatsCard
              title="Payroll Cost"
              value={`₹${(stats?.monthlyPayroll || 0).toLocaleString()}`}
              description="This month's total"
              icon={TrendingUp}
            />
            <StatsCard
              title="Project Load"
              value={stats?.activeProjects || 0}
              description={`${stats?.totalProjects || 0} total projects`}
              icon={Briefcase}
            />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Pending Actions */}
        <Card className="lg:col-span-4 rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Action Items</CardTitle>
              <CardDescription>Requests requiring your immediate attention</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Link href="/admin/leaves" className="block group">
                  <div className="p-6 rounded-2xl bg-amber-500/[0.03] border border-amber-500/10 hover:border-amber-500/30 hover:bg-amber-500/[0.06] transition-all group-hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none">Leave</Badge>
                    </div>
                    <div className="text-3xl font-black text-amber-600">{stats?.pendingLeaves || 0}</div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Pending Approval</div>
                  </div>
                </Link>
                <Link href="/admin/tasks" className="block group">
                  <div className="p-6 rounded-2xl bg-primary/[0.03] border border-primary/10 hover:border-primary/30 hover:bg-primary/[0.06] transition-all group-hover:shadow-md">
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary border-none">Tasks</Badge>
                    </div>
                    <div className="text-3xl font-black text-primary">{stats?.tasks.pending || 0}</div>
                    <div className="text-sm font-bold text-muted-foreground uppercase tracking-tight">Ongoing Tasks</div>
                  </div>
                </Link>
              </div>
            
            <div className="pt-4 flex justify-between items-center">
               <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                  <AlertCircle className="h-4 w-4" />
                  <span>You have {stats?.pendingITRequests || 0} pending IT requests.</span>
               </div>
               <Button variant="ghost" size="sm" asChild className="text-xs font-bold group">
                 <Link href="/admin/it-requests">
                   IT Manager <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                 </Link>
               </Button>
            </div>
          </CardContent>
          <div className="bg-muted/30 p-4 border-t border-muted-foreground/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-600">
                 <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">Upcoming Holiday</p>
                <p className="text-sm font-black">{stats?.upcomingHoliday?.name || "No upcoming holidays"}</p>
              </div>
            </div>
            {stats?.upcomingHoliday && (
              <Badge variant="secondary" className="font-bold">
                {new Date(stats.upcomingHoliday.date).toLocaleDateString()}
              </Badge>
            )}
          </div>
        </Card>

        {/* Recent Hires */}
        <Card className="lg:col-span-3 rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
          <CardHeader>
            <CardTitle className="text-xl font-bold">New Hires</CardTitle>
            <CardDescription>Latest additions to your team</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
              <div className="space-y-6">
                {recentEmployees.length > 0 ? (
                  recentEmployees.map((emp) => (
                    <div key={emp._id} className="flex items-center gap-4 group">
                      <Avatar className="h-11 w-11 border-2 border-primary/10 transition-transform group-hover:scale-105">
                        <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                          {emp.firstName?.[0]?.toUpperCase() || ''}{emp.lastName?.[0]?.toUpperCase() || (!emp.firstName?.[0] ? '?' : '')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm font-bold leading-none">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-muted-foreground font-medium">{emp.position}</p>
                      </div>
                      <Badge variant="secondary" className="bg-muted/50 text-[10px] font-bold uppercase tracking-tighter">
                        {emp.department}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No recent hires found.</p>
                )}
                
                <Link href="/admin/employees">
                  <Button variant="outline" className="w-full mt-2 rounded-2xl border-dashed border-2 hover:border-primary hover:text-primary transition-all">
                    Manage Directory
                  </Button>
                </Link>
              </div>
          </CardContent>
          <div className="p-6 bg-primary/5 border-t border-primary/10">
             <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                   <Activity className="h-4 w-4 text-primary" />
                   Internal Notice
                </CardTitle>
                <Badge className="bg-primary/20 text-primary border-none text-[10px]">LATEST</Badge>
             </div>
             <div className="space-y-2">
                <p className="text-sm font-bold line-clamp-1">{stats?.latestAnnouncement?.title || "No announcements"}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                   {stats?.latestAnnouncement?.content || "Company updates and news will appear here."}
                </p>
             </div>
          </div>
        </Card>
      </div>

      {/* Recent Tasks Section */}
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Recent Tasks</h2>
            <Link href="/admin/tasks">
               <Button variant="ghost" size="sm" className="font-bold">View Board <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
         </div>
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
               {recentTasks.map((task) => (
                  <div key={task._id} className="p-4 rounded-2xl bg-card border border-muted-foreground/10 flex flex-col justify-between space-y-3 hover:shadow-md transition-all group">
                     <div>
                        <div className="flex items-center justify-between mb-2">
                           <Badge className={`text-[9px] font-black uppercase tracking-tighter border-none ${
                              task.priority === 'High' ? 'bg-rose-500/10 text-rose-600' : 
                              task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 
                              'bg-emerald-500/10 text-emerald-600'
                           }`}>
                              {task.priority}
                           </Badge>
                           <span className="text-[10px] font-bold text-muted-foreground uppercase">{task.status}</span>
                        </div>
                        <p className="text-sm font-bold line-clamp-2 group-hover:text-primary transition-colors">{task.title}</p>
                     </div>
                     <div className="flex -space-x-2">
                        {task.assigneeIds.map((assignee, i) => (
                           <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-[8px] font-black bg-muted">
                                 {assignee.firstName?.[0]}{assignee.lastName?.[0]}
                              </AvatarFallback>
                           </Avatar>
                        ))}
                     </div>
                  </div>
               ))}
            {recentTasks.length === 0 && (
               <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed border-muted">
                  No recent tasks found. Create tasks to track work.
               </div>
            )}
         </div>
      </div>
    </div>
  )
}
