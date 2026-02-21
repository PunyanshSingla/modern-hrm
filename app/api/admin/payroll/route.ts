import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import EmployeeProfile from "@/models/EmployeeProfile";
import Department from "@/models/Department";
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
import { startOfMonth, endOfMonth, getMonth, getYear, getDaysInMonth } from "date-fns";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month") ? parseInt(searchParams.get("month")!) : getMonth(new Date());
        const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : getYear(new Date());

        await connectToDatabase();
        
        // 1. Fetch Employees and their Salary Structures
        const employees = await EmployeeProfile.find({ status: { $ne: 'disabled' } })
            .populate({ path: 'departmentId', select: 'name', model: Department })
            .populate({ path: 'salaryStructureId', model: SalaryStructure })
            .lean();

        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(new Date(year, month));
        const totalDaysInMonth = getDaysInMonth(new Date(year, month));

        // 2. Fetch Finalized Records
        const finalizedRecords = await Payroll.find({ month, year }).lean();

        // 3. Fetch Attendance & Holidays
        const allAttendance = await Attendance.find({
            date: { $gte: start, $lte: end },
            approvalStatus: 'Approved'
        }).lean();

        const holidays = await Holiday.find({
            date: { $gte: start, $lte: end }
        }).lean();

        console.log(`Payroll GET: Fetching for ${month}/${year}. Start: ${start.toISOString()}, End: ${end.toISOString()}`);
        console.log(`Found ${employees.length} employees, ${allAttendance.length} attendance records, ${holidays.length} holidays.`);

        const employeesWithPayroll = employees.map((emp: any) => {
            const finalized = finalizedRecords.find(r => r.employeeId.toString() === emp._id.toString());
            
            if (finalized) {
                return {
                    ...emp,
                    payrollStatus: finalized.status,
                    payrollData: finalized
                };
            }

            // 4. Calculate Projection (Draft)
            const empAttendance = allAttendance.filter(a => a.employeeId.toString() === emp._id.toString());
            const presentDays = empAttendance.filter(r => r.status === 'Present').length;
            const halfDays = empAttendance.filter(r => r.status === 'Half Day').length;
            const leaveDays = empAttendance.filter(r => r.status === 'On Leave').length;
            const holidayDays = holidays.length;

            // Strict LOP Calculation
            // Paid Days = Present + (Half * 0.5) + Approved Leave + Holidays
            const paidDays = presentDays + (halfDays * 0.5) + leaveDays + holidayDays;
            const lopDays = Math.max(0, totalDaysInMonth - paidDays);

            // Structure Calculation
            const structure = emp.salaryStructureId;
            let earnings: any[] = [];
            let deductions: any[] = [];
            let statutory = { pfEmployee: 0, pfEmployer: 0, esiEmployee: 0, esiEmployer: 0, pt: 0, tds: 0 };

            if (structure && structure.components) {
                const basicComponent = structure.components.find((c: any) => c.label === 'Basic');
                const basicMonthly = basicComponent ? (basicComponent.value || 0) : 0;
                
                // Pro-rata Earnings
                earnings = structure.components
                    .filter((c: any) => c.type === 'Earning')
                    .map((c: any) => ({
                        label: c.label,
                        amount: calculateProRata(c.value || 0, totalDaysInMonth, paidDays)
                    }));

                const grossEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
                const proRatedBasic = calculateProRata(basicMonthly, totalDaysInMonth, paidDays);

                // Statutory Deductions
                statutory.pfEmployee = calculatePF(proRatedBasic);
                statutory.pfEmployer = calculatePF(proRatedBasic); // Simplified employer match
                
                const esi = calculateESI(grossEarnings);
                statutory.esiEmployee = esi.employee;
                statutory.esiEmployer = esi.employer;
                
                statutory.pt = calculatePT(grossEarnings, month);
                
                deductions.push({ label: 'PF', amount: statutory.pfEmployee, category: 'Statutory' });
                if (statutory.esiEmployee > 0) {
                    deductions.push({ label: 'ESI', amount: statutory.esiEmployee, category: 'Statutory' });
                }
                deductions.push({ label: 'PT', amount: statutory.pt, category: 'Statutory' });
            } else {
                // Fallback for missing structure
                const monthlyBase = emp.baseSalary || 0;
                const proRatedBase = calculateProRata(monthlyBase, totalDaysInMonth, paidDays);
                earnings.push({ label: 'Base Salary', amount: proRatedBase });
            }

            const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
            const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
            const netPayable = totalEarnings - totalDeductions;

            return {
                ...emp,
                payrollStatus: 'Draft',
                attendanceStats: {
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
                    statutory,
                    totalEarnings,
                    totalDeductions,
                    netPayable
                }
            };
        });

        return NextResponse.json({ 
            success: true, 
            employees: employeesWithPayroll,
            month,
            year
        });
    } catch (error: any) {
        console.error("Payroll GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { employeeId, month, year, calculation, attendanceStats, salarySnapshot, generatedBy } = body;

        await connectToDatabase();

        // Atomic update or create for the specific month/year/employee
        const record = await Payroll.findOneAndUpdate(
            { employeeId, month, year },
            { 
                ...calculation,
                attendanceSnapshot: attendanceStats,
                salarySnapshot,
                status: 'Generated',
                generatedBy,
                generatedAt: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, record });
    } catch (error: any) {
        console.error("Payroll POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { id, baseSalary } = body;

        if (!id || baseSalary === undefined) {
            return NextResponse.json({ success: false, error: "Missing ID or salary" }, { status: 400 });
        }

        await connectToDatabase();
        const updated = await EmployeeProfile.findByIdAndUpdate(
            id,
            { baseSalary: Number(baseSalary) },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, employee: updated });
    } catch (error: any) {
        console.error("Payroll PATCH Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

