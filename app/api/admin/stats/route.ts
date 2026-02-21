import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      Project.countDocuments({ status: "In Progress" }),
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
      Holiday.findOne({ date: { $gte: now } }).sort({ date: 1 }),
      Announcement.findOne({}).sort({ createdAt: -1 })
    ]);

    // Get recent employees
    const recentEmployees = await EmployeeProfile.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select("firstName lastName position department");

    // Get recent tasks
    const recentTasks = await Task.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("assigneeIds", "firstName lastName");

    return NextResponse.json({
      success: true,
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
        upcomingHoliday,
        latestAnnouncement
      },
      recentEmployees,
      recentTasks
    });
  } catch (error: any) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
