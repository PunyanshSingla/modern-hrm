import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import EmployeeProfile from "@/models/EmployeeProfile";
import Department from "@/models/Department";
import Project from "@/models/Project";
import Leave from "@/models/Leave";
import ITRequest from "@/models/ITRequest";
import Attendance from "@/models/Attendance";
import Task from "@/models/Task";
import Payroll from "@/models/Payroll";
import Holiday from "@/models/Holiday";
import Announcement from "@/models/Announcement";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user as any).role !== "admin") {
    redirect("/auth/login");
  }

  await connectToDatabase();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const [
    totalEmployees,
    totalDepartments,
    totalProjects,
    pendingLeaves,
    pendingITRequests,
    activeProjects,
    todayAttendance,
    totalTasks,
    pendingTasks,
    monthlyPayroll,
    upcomingHoliday,
    latestAnnouncement
  ] = await Promise.all([
    EmployeeProfile.countDocuments({}),
    Department.countDocuments({}),
    Project.countDocuments({}),
    Leave.countDocuments({ status: "Pending" }),
    ITRequest.countDocuments({ status: "Pending" }),
    Project.countDocuments({ status: "Active" }),
    Attendance.countDocuments({ 
      date: { 
        $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
      } 
    }),
    Task.countDocuments({}),
    Task.countDocuments({ status: { $ne: "Completed" } }),
    Payroll.aggregate([
      { $match: { month: currentMonth, year: currentYear } },
      { $group: { _id: null, total: { $sum: "$netPayable" } } }
    ]),
    Holiday.findOne({ date: { $gte: now } }).sort({ date: 1 }).lean(),
    Announcement.findOne({}).sort({ createdAt: -1 }).lean()
  ]);

  // Get recent employees
  const recentEmployees = await EmployeeProfile.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("firstName lastName position department")
    .lean();

  // Get recent tasks
  const recentTasks = await Task.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate({
        path: "assigneeIds",
        select: "firstName lastName",
        model: EmployeeProfile
    })
    .lean();

  const data = {
    stats: {
      totalEmployees,
      totalDepartments,
      totalProjects,
      pendingLeaves,
      pendingITRequests,
      activeProjects,
      todayAttendance,
      tasks: {
        total: totalTasks,
        pending: pendingTasks
      },
      monthlyPayroll: monthlyPayroll[0]?.total || 0,
      upcomingHoliday: upcomingHoliday ? JSON.parse(JSON.stringify(upcomingHoliday)) : null,
      latestAnnouncement: latestAnnouncement ? JSON.parse(JSON.stringify(latestAnnouncement)) : null
    },
    recentEmployees: JSON.parse(JSON.stringify(recentEmployees)),
    recentTasks: JSON.parse(JSON.stringify(recentTasks))
  };

  return <AdminDashboardClient initialData={data as any} />;
}
