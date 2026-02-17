import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import EmployeeProfile from "@/models/EmployeeProfile";
import Attendance from "@/models/Attendance";
import Holiday from "@/models/Holiday";
import Payroll from "@/models/Payroll";
import SalaryStructure from "@/models/SalaryStructure";
import { 
  calculatePF, 
  calculateESI, 
  calculatePT, 
  calculateProRata 
} from "@/lib/payroll-engine";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { startOfMonth, endOfMonth, getMonth, getYear, getDaysInMonth } from "date-fns";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : getMonth(new Date());
        const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : getYear(new Date());

        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const profile = await EmployeeProfile.findOne({ userId: session.user.id })
            .populate('departmentId', 'name')
            .populate('salaryStructureId')
            .lean() as any;
        
        if (!profile) {
            return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
        }

        // 1. Try to find a finalized payroll record
        const finalized = await Payroll.findOne({ 
            employeeId: profile._id, 
            month, 
            year 
        }).lean();

        if (finalized) {
            return NextResponse.json({ 
                success: true, 
                profile,
                payrollStatus: finalized.status,
                stats: finalized.attendanceSnapshot,
                calculation: finalized,
                actualPayout: finalized.netPayable
            });
        }

        // 2. If not finalized, return projection (Draft)
        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(new Date(year, month));
        const totalDaysInMonth = getDaysInMonth(new Date(year, month));

        const attendanceRecords = await Attendance.find({
            employeeId: profile._id,
            date: { $gte: start, $lte: end },
            approvalStatus: 'Approved'
        });

        const holidays = await Holiday.find({
            date: { $gte: start, $lte: end }
        }).lean();

        const presentDays = attendanceRecords.filter(r => r.status === 'Present').length;
        const halfDays = attendanceRecords.filter(r => r.status === 'Half Day').length;
        const leaveDays = attendanceRecords.filter(r => r.status === 'On Leave').length;
        const holidayDays = holidays.length;

        const paidDays = presentDays + (halfDays * 0.5) + leaveDays + holidayDays;
        const lopDays = Math.max(0, totalDaysInMonth - paidDays);

        const structure = profile.salaryStructureId;
        let earnings: any[] = [];
        let deductions: any[] = [];
        let statutory = { pfEmployee: 0, pfEmployer: 0, esiEmployee: 0, esiEmployer: 0, pt: 0, tds: 0 };

        if (structure && structure.components) {
            const basicComponent = structure.components.find((c: any) => c.label === 'Basic');
            const basicMonthly = basicComponent ? basicComponent.value : 0;
            
            earnings = structure.components
                .filter((c: any) => c.type === 'Earning')
                .map((c: any) => ({
                    label: c.label,
                    amount: calculateProRata(c.value, totalDaysInMonth, paidDays)
                }));

            const grossEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
            const proRatedBasic = calculateProRata(basicMonthly, totalDaysInMonth, paidDays);

            statutory.pfEmployee = calculatePF(proRatedBasic);
            statutory.esiEmployee = calculateESI(grossEarnings).employee;
            statutory.pt = calculatePT(grossEarnings, month);
            
            deductions.push({ label: 'PF', amount: statutory.pfEmployee, category: 'Statutory' });
            if (statutory.esiEmployee > 0) {
                deductions.push({ label: 'ESI', amount: statutory.esiEmployee, category: 'Statutory' });
            }
            deductions.push({ label: 'PT', amount: statutory.pt, category: 'Statutory' });
        } else {
            const monthlyBase = profile.baseSalary || 0;
            const proRatedBase = calculateProRata(monthlyBase, totalDaysInMonth, paidDays);
            earnings.push({ label: 'Base Salary', amount: proRatedBase });
        }

        const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
        const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
        const netPayable = totalEarnings - totalDeductions;

        return NextResponse.json({ 
            success: true, 
            profile,
            payrollStatus: 'Draft',
            stats: {
                totalDays: totalDaysInMonth,
                paidDays,
                lopDays,
                presentDays,
                halfDays,
                leaveDays,
                holidayDays
            },
            calculation: {
                earnings,
                deductions,
                totalEarnings,
                totalDeductions,
                netPayable,
                statutory
            },
            actualPayout: netPayable
        });
    } catch (error: any) {
        console.error("Employee Pay API Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
