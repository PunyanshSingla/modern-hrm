import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Attendance from "@/models/Attendance";
import EmployeeProfile from "@/models/EmployeeProfile";

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const body = await req.json().catch(() => ({}));
        const month = body.month ?? 1;
        const year = body.year ?? 2026;

        const employees = await EmployeeProfile.find({ status: { $ne: 'disabled' } }).limit(5).lean();
        if (employees.length === 0) {
            return NextResponse.json({ success: false, error: "No employees found" });
        }

        const date = new Date(year, month, 15); // middle of month
        const attendance = {
            employeeId: employees[0]._id,
            date: date,
            checkInTime: date,
            status: 'Present',
            approvalStatus: 'Approved',
            location: { latitude: 0, longitude: 0 }
        };

        await Attendance.create(attendance);

        return NextResponse.json({ 
            success: true, 
            message: "Created 1 record for " + employees[0].firstName,
            count: employees.length
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
