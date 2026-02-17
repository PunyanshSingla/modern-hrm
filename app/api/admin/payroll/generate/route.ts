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
import { startOfMonth, endOfMonth, getDaysInMonth } from "date-fns";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { month, year, adjustments = {} } = body;

        await connectToDatabase();

        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(new Date(year, month));
        const totalDaysInMonth = getDaysInMonth(new Date(year, month));

        const employees = await EmployeeProfile.find({ status: { $ne: 'disabled' } })
            .populate('salaryStructureId')
            .lean();

        console.log(`Found ${employees.length} employees to process`);

        const holidays = await Holiday.find({
            date: { $gte: start, $lte: end }
        }).lean();

        const results = [];

        for (const emp of employees) {
            console.log(`Processing employee: ${emp.firstName} ${emp.lastName} (ID: ${emp._id})`);
            // Skip if already generated and closed
            const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
            if (existing && existing.status === 'Closed') continue;

            const empAttendance = await Attendance.find({
                employeeId: emp._id,
                date: { $gte: start, $lte: end },
                approvalStatus: 'Approved'
            }).lean();

            const presentDays = empAttendance.filter(a => a.status === 'Present').length;
            const halfDays = empAttendance.filter(a => a.status === 'Half Day').length;
            const leaveDays = empAttendance.filter(a => a.status === 'On Leave').length;
            const holidayDays = holidays.length;

            const paidDays = presentDays + (halfDays * 0.5) + leaveDays + holidayDays;
            const lopDays = Math.max(0, totalDaysInMonth - paidDays);

            const structure: any = emp.salaryStructureId;
            let earnings: any[] = [];
            let deductions: any[] = [];
            let statutory = { pfEmployee: 0, pfEmployer: 0, esiEmployee: 0, esiEmployer: 0, pt: 0, tds: 0 };
            
            // Add Ad-hoc Adjustments
            const empAdjustments = adjustments[emp._id.toString()] || [];
            for (const adj of empAdjustments) {
                if (adj.type === 'Deduction') {
                    deductions.push({ label: adj.label, amount: adj.amount, category: 'Adjustment' });
                } else {
                    earnings.push({ label: adj.label, amount: adj.amount, isArrear: adj.type === 'Arrear', category: 'Adjustment' });
                }
            }

            let salarySnapshot: any = { ctcAnnual: (emp.baseSalary || 0) * 12, components: [] };

            if (structure && structure.components) {
                salarySnapshot = {
                    ctcAnnual: structure.ctcAnnual || 0,
                    components: structure.components.map((c: any) => ({
                        label: c.label,
                        amount: c.value || 0,
                        type: c.type,
                        valueType: c.valueType
                    }))
                };

                // 1. Calculate Earnings (First pass for fixed/pro-rated)
                const earningsMap = new Map();
                
                // Identify Basic first as it's often a base for others
                const basicComp = structure.components.find((c: any) => c.label === 'Basic');
                const basicMonthly = basicComp ? (basicComp.valueType === 'Percentage' ? (structure.ctcAnnual / 12) * (basicComp.value / 100) : basicComp.value) : 0;
                const proRatedBasic = calculateProRata(basicMonthly, totalDaysInMonth, paidDays);

                for (const c of structure.components.filter((comp: any) => comp.type === 'Earning')) {
                    let monthlyVal = 0;
                    if (c.valueType === 'Percentage') {
                        // If it has a baseComponentId, calculate % of that, else % of CTC/12
                        monthlyVal = (structure.ctcAnnual / 12) * (c.value / 100);
                    } else {
                        monthlyVal = c.value;
                    }

                    const proRatedVal = calculateProRata(monthlyVal, totalDaysInMonth, paidDays);
                    earnings.push({
                        label: c.label,
                        amount: proRatedVal,
                        isArrear: false
                    });
                    earningsMap.set(c.label, proRatedVal);
                }

                const grossEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

                // 2. Calculate Statutory Deductions
                statutory.pfEmployee = calculatePF(proRatedBasic);
                statutory.pfEmployer = calculatePF(proRatedBasic);
                
                const esi = calculateESI(grossEarnings);
                statutory.esiEmployee = esi.employee;
                statutory.esiEmployer = esi.employer;
                
                statutory.pt = calculatePT(grossEarnings, month);
                
                deductions.push({ label: 'PF', amount: statutory.pfEmployee, category: 'Statutory' });
                if (statutory.esiEmployee > 0) {
                    deductions.push({ label: 'ESI', amount: statutory.esiEmployee, category: 'Statutory' });
                }
                deductions.push({ label: 'PT', amount: statutory.pt, category: 'Statutory' });

                // 3. Handle Template-defined Deductions
                for (const c of structure.components.filter((comp: any) => comp.type === 'Deduction')) {
                    const amount = c.valueType === 'Percentage' ? (grossEarnings * (c.value / 100)) : c.value;
                    deductions.push({ label: c.label, amount: Math.round(amount), category: 'Custom' });
                }
            } else {
                const monthlyBase = emp.baseSalary || 0;
                const proRatedBase = calculateProRata(monthlyBase, totalDaysInMonth, paidDays);
                earnings.push({ label: 'Base Salary', amount: proRatedBase, isArrear: false });
                
                salarySnapshot.components.push({ label: 'Base Salary', amount: monthlyBase, type: 'Earning' });
            }

            const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);
            const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
            const netPayable = totalEarnings - totalDeductions;

            console.log(`Generated payroll for ${emp.firstName}: Net ${netPayable}`);

            const payrollRecord = await Payroll.findOneAndUpdate(
                { employeeId: emp._id, month, year },
                {
                    salarySnapshot,
                    attendanceSnapshot: {
                        totalDays: totalDaysInMonth,
                        workingDays: totalDaysInMonth - 8,
                        paidDays,
                        presentDays,
                        halfDays,
                        leaveDays,
                        holidayDays,
                        lopDays
                    },
                    earnings,
                    deductions,
                    totalEarnings,
                    totalDeductions,
                    netPayable,
                    statutory,
                    adjustments: empAdjustments.map((a: any) => ({
                        label: a.label,
                        amount: a.amount,
                        type: a.type === 'Bonus' ? 'Bonus' : (a.type === 'Deduction' ? 'Deduction' : 'Arrear')
                    })),
                    status: 'Generated',
                    generatedBy: session.user.id,
                    generatedAt: new Date()
                },
                { upsert: true, new: true, runValidators: true }
            );

            results.push(payrollRecord);
        }

        return NextResponse.json({ success: true, count: results.length });
    } catch (error: any) {
        console.error("Bulk Payroll Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
