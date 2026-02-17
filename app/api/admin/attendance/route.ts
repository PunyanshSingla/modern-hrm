import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import "@/models/EmployeeProfile";
import "@/models/Department";
import "@/models/User";
import Attendance from "@/models/Attendance";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        
        // Populate employee details for display
        // We need to go through EmployeeProfile -> User to get the email
        const attendances = await Attendance.find({})
            .populate({
                path: 'employeeId',
                select: 'firstName lastName departmentId position userId',
                populate: [
                    {
                        path: 'departmentId',
                        select: 'name'
                    },
                    {
                        path: 'userId',
                        select: 'email'
                    }
                ]
            })
            .sort({ date: -1 });

        // Map fields for frontend compatibility
        const formattedAttendances = attendances.map((att: any) => {
            const attObj = att.toObject();
            if (attObj.employeeId) {
                attObj.employeeId.jobTitle = attObj.employeeId.position || "N/A";
                // Get email from User model if populated, otherwise fallback
                attObj.employeeId.email = attObj.employeeId.userId?.email || "";
            }
            return attObj;
        });

        return NextResponse.json({ success: true, attendances: formattedAttendances });
    } catch (error) {
        console.error("Error fetching attendances:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch attendance records" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        
        const { employeeId, date, checkInTime, location, status } = body;

        // Basic validation
        if (!employeeId || !date || !checkInTime || !location) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const newAttendance = await Attendance.create({
            employeeId,
            date: new Date(date),
            checkInTime: new Date(checkInTime),
            location,
            status: status || 'Present',
            approvalStatus: 'Approved' // Default to approved as per requirements
        });

        return NextResponse.json({ success: true, attendance: newAttendance }, { status: 201 });

    } catch (error) {
        console.error("Error creating attendance:", error);
        return NextResponse.json({ success: false, error: "Failed to create attendance record" }, { status: 500 });
    }
}
