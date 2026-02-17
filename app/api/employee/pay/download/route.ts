import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import EmployeeProfile from "@/models/EmployeeProfile";
import Attendance from "@/models/Attendance";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(req: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const profile = await EmployeeProfile.findOne({ userId: session.user.id })
            .populate('departmentId', 'name')
            .lean() as any;
        
        if (!profile) return NextResponse.json({ success: false }, { status: 404 });

        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());

        const attendanceRecords = await Attendance.find({
            employeeId: profile._id,
            date: { $gte: start, $lte: end },
            approvalStatus: 'Approved'
        });

        const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
        const halfDays = attendanceRecords.filter(r => r.status === 'Half Day').length;
        const leaveDays = attendanceRecords.filter(r => r.status === 'On Leave').length;
        const effectiveWorkingDays = presentDays + (halfDays * 0.5) + leaveDays;
        const monthlyWorkDays = 22;
        const dailyRate = profile.baseSalary / monthlyWorkDays;
        const actualPayout = Math.min(profile.baseSalary, Math.round(effectiveWorkingDays * dailyRate));

        // Default to TXT with Rupee Symbol
        const payslipContent = `
=========================================
          OFFICIAL PAYSLIP (₹)
=========================================
EMPLOYEE DETAILS:
Name: ${profile.firstName} ${profile.lastName}
ID: ${profile._id}
Department: ${profile.departmentId?.name || 'N/A'}
Position: ${profile.position}

PERIOD: ${format(start, 'MMMM yyyy')}

ATTENDANCE SUMMARY:
Regular Days: ${presentDays}
Half Days: ${halfDays}
Leaves (Paid): ${leaveDays}
Effective Work Units: ${effectiveWorkingDays} / ${monthlyWorkDays}

EARNINGS:
Base Monthly Salary: ₹ ${profile.baseSalary.toLocaleString()}
Calculated Daily Rate: ₹ ${dailyRate.toFixed(2)}
-----------------------------------------
TOTAL NET PAYABLE: ₹ ${actualPayout.toLocaleString()}
=========================================
Generated on: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}
Modern HRM Systems Inc.
        `;

        return new NextResponse(payslipContent, {
            headers: {
                "Content-Type": "text/plain",
                "Content-Disposition": `attachment; filename=payslip-${format(new Date(), 'MMM-yyyy')}.txt`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
