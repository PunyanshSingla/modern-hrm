import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Attendance from "@/models/Attendance";
import EmployeeProfile from "@/models/EmployeeProfile";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, format } from "date-fns";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const month = body.month !== undefined ? parseInt(body.month) : new Date().getMonth();
        const year = body.year !== undefined ? parseInt(body.year) : new Date().getFullYear();

        if (isNaN(month) || isNaN(year)) {
             return NextResponse.json({ success: false, error: "Invalid month or year" }, { status: 400 });
        }

        await connectToDatabase();
        console.log(`Debug Seeding: month=${month}, year=${year}`);

        const start = startOfMonth(new Date(year, month));
        const end = endOfMonth(new Date(year, month));
        const days = eachDayOfInterval({ start, end });

        const employees = await EmployeeProfile.find({ status: { $ne: 'disabled' } }).lean();
        console.log(`[SEED] Seeding for ${employees.length} employees`);
        
        let totalCreated = 0;
        for (const emp of employees) {
            const records = [];
            for (const day of days) {
                if (isWeekend(day)) continue;
                
                const rand = Math.random();
                if (rand > 0.98) continue; // Randomly absent

                const checkIn = new Date(day);
                checkIn.setHours(9, 30, 0);
                const checkOut = new Date(day);
                checkOut.setHours(18, 30, 0);

                records.push({
                    employeeId: emp._id,
                    date: day,
                    checkInTime: checkIn,
                    checkOutTime: checkOut,
                    status: rand > 0.9 ? 'Half Day' : 'Present',
                    approvalStatus: 'Approved',
                    location: { latitude: 12.97, longitude: 77.59, address: "Seeded Location" }
                });
            }

            if (records.length > 0) {
                await Attendance.deleteMany({
                    employeeId: emp._id,
                    date: { $gte: start, $lte: end }
                });
                await Attendance.insertMany(records);
                totalCreated += records.length;
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully seeded ${totalCreated} records for ${employees.length} employees for ${format(start, 'MMMM yyyy')}.`
        });
    } catch (error: any) {
        console.error("Seeding Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
