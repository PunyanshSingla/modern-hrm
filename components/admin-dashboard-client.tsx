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
  ArrowRight,
  UserPlus,
  PlusCircle,
  Megaphone
} from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
    completed?: number
  }
  departmentDistribution?: { _id: string; count: number }[]
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
  const attendanceRate = stats?.totalEmployees ? Math.round((stats.todayAttendance / stats.totalEmployees) * 100) : 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Executive Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/60 pb-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Activity className="h-3.5 w-3.5" /> Organizational Overview
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Welcome back. Here is a summary of team activity and operations today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" asChild className="rounded-lg text-xs font-medium h-8">
            <Link href="/admin/announcements">
              <Megaphone className="h-3.5 w-3.5 mr-1.5" /> Post Announcement
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="rounded-lg text-xs font-medium h-8">
            <Link href="/admin/tasks">
              <PlusCircle className="h-3.5 w-3.5 mr-1.5" /> New Task
            </Link>
          </Button>
          <Button size="sm" asChild className="rounded-lg text-xs font-medium h-8 shadow-sm">
            <Link href="/admin/employees">
              <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Employee
            </Link>
          </Button>
        </div>
      </div>

      {/* Grid of Stats Cards */}
      <div className="grid gap-3.5 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Staff"
          value={stats?.totalEmployees || 0}
          description="Active team members"
          icon={Users}
          href="/admin/employees"
        />
        <StatsCard
          title="Today's Attendance"
          value={`${stats?.todayAttendance || 0} (${attendanceRate}%)`}
          description="Checked in today"
          icon={CheckCircle2}
          href="/admin/attendance"
          trend={{ value: attendanceRate, isPositive: true }}
        />
        <StatsCard
          title="Monthly Payroll"
          value={`₹${(stats?.monthlyPayroll || 0).toLocaleString()}`}
          description="Current month payable"
          icon={TrendingUp}
          href="/admin/payroll"
        />
        <StatsCard
          title="Active Projects"
          value={stats?.activeProjects || 0}
          description={`${stats?.totalProjects || 0} total registered`}
          icon={Briefcase}
          href="/admin/projects"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-7 items-start">
        {/* Left Main Column: Action Items & Operations Metrics */}
        <div className="lg:col-span-4 space-y-5">
          <Card>
            <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Action Required</CardTitle>
                <CardDescription>Requests requiring management review</CardDescription>
              </div>
              <Badge variant="secondary" className="text-[11px] font-medium px-2 py-0.5">
                {((stats?.pendingLeaves || 0) + (stats?.pendingITRequests || 0))} Pending
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/admin/leaves" className="block group">
                  <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Clock className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-300 text-[10px] uppercase font-semibold">
                        Leave Requests
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{stats?.pendingLeaves || 0}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Pending approval</p>
                  </div>
                </Link>
                <Link href="/admin/tasks" className="block group">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="border-primary/30 text-primary text-[10px] uppercase font-semibold">
                        Task Board
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-primary">{stats?.tasks.pending || 0}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">Ongoing tasks</p>
                  </div>
                </Link>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                  <span>You have <strong>{stats?.pendingITRequests || 0}</strong> pending IT support requests.</span>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold hover:bg-background">
                  <Link href="/admin/it-requests">
                    View Requests <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </CardContent>

            <CardFooter className="py-2.5 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground leading-tight">Upcoming Holiday</p>
                  <p className="text-xs font-semibold text-foreground leading-tight">{stats?.upcomingHoliday?.name || "No upcoming holidays"}</p>
                </div>
              </div>
              {stats?.upcomingHoliday && (
                <Badge variant="outline" className="text-[10px] font-medium">
                  {new Date(stats.upcomingHoliday.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </Badge>
              )}
            </CardFooter>
          </Card>

          {/* Department Headcount Breakdown Widget */}
          <Card>
            <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Department Headcount</CardTitle>
                <CardDescription>Employee distribution across departments</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold">
                <Link href="/admin/departments">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {stats.departmentDistribution.map((dept) => {
                    const percent = stats.totalEmployees ? Math.round((dept.count / stats.totalEmployees) * 100) : 0;
                    return (
                      <div key={dept._id || 'unassigned'} className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-foreground truncate max-w-[120px]">{dept._id || 'General'}</span>
                          <span className="text-muted-foreground font-medium">{dept.count} staff ({percent}%)</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-2">No department distribution available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Recent Hires & Latest Announcement */}
        <div className="lg:col-span-3 space-y-5">
          {/* Standalone New Hires Card */}
          <Card>
            <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>New Hires</CardTitle>
                <CardDescription>Recently onboarded staff</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold">
                <Link href="/admin/employees">View Directory</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {recentEmployees.length > 0 ? (
                recentEmployees.map((emp) => (
                  <div key={emp._id} className="flex items-center gap-3 text-xs py-1.5 border-b border-border/30 last:border-b-0">
                    <Avatar className="h-7 w-7 border border-border/60 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-[10px]">
                        {emp.firstName?.[0]?.toUpperCase() || ''}{emp.lastName?.[0]?.toUpperCase() || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground truncate text-xs">{emp.firstName} {emp.lastName}</p>
                      <p className="text-muted-foreground truncate text-[11px]">{emp.position}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] font-medium shrink-0">
                      {emp.department}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-3 text-center text-xs text-muted-foreground">No recent hires found.</div>
              )}
            </CardContent>
          </Card>

          {/* Standalone Announcement Card */}
          <Card>
            <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary shrink-0" />
                <div>
                  <CardTitle>Company Broadcast</CardTitle>
                  <CardDescription>Latest announcement</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 text-xs font-semibold">
                <Link href="/admin/announcements">All Posts</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {stats?.latestAnnouncement ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-bold text-foreground line-clamp-1">{stats.latestAnnouncement.title}</p>
                    <Badge variant="outline" className="text-[9px] font-semibold text-primary border-primary/30 shrink-0">
                      {new Date(stats.latestAnnouncement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {stats.latestAnnouncement.content}
                  </p>
                </div>
              ) : (
                <div className="py-3 text-center text-xs text-muted-foreground">No announcement published yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Tasks Board Row */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-foreground">Recent Tasks</h2>
            <p className="text-xs text-muted-foreground">Overview of team task status & priorities</p>
          </div>
          <Link href="/admin/tasks">
            <Button variant="outline" size="sm" className="h-7 text-xs font-medium">
              View Board <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          {recentTasks?.map((task) => (
            <div key={task._id} className="p-3.5 rounded-xl bg-card border border-border/60 flex flex-col justify-between space-y-2 hover:border-primary/30 transition-all shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Badge variant="secondary" className={`text-[10px] font-semibold px-1.5 py-0.5 ${
                    task.priority === 'High' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 
                    task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 
                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                  }`}>
                    {task.priority}
                  </Badge>
                  <span className="text-[10px] font-medium text-muted-foreground">{task.status}</span>
                </div>
                <p className="text-xs font-semibold text-foreground line-clamp-2">{task.title}</p>
              </div>
              <div className="flex -space-x-1.5 overflow-hidden pt-1">
                {task.assigneeIds?.map((assignee, i) => (
                  <Avatar key={i} className="h-5.5 w-5.5 border-2 border-background">
                    <AvatarFallback className="text-[8px] font-semibold bg-muted">
                      {assignee?.firstName?.[0]}{assignee?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
            </div>
          ))}
          {recentTasks.length === 0 && (
            <div className="col-span-full py-6 text-center text-xs text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/60">
              No active tasks found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
