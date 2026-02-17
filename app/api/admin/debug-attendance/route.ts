import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Attendance from "@/models/Attendance";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const month = parseInt(searchParams.get("month") || "1");
    const year = parseInt(searchParams.get("year") || "2026");
    
    await connectToDatabase();
    const start = startOfMonth(new Date(year, month));
    const end = endOfMonth(new Date(year, month));
    
    const count = await Attendance.countDocuments({
        date: { $gte: start, $lte: end }
    });
    
    const uniqueEmployees = await Attendance.distinct("employeeId", {
        date: { $gte: start, $lte: end }
    });

    const sample = await Attendance.findOne({
        date: { $gte: start, $lte: end }
    }).lean();

    return NextResponse.json({ 
        month, 
        year, 
        count,
        uniqueEmployeesCount: uniqueEmployees.length,
        startISO: start.toISOString(),
        endISO: end.toISOString(),
        sample 
    });
}
