import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Attendance from "@/models/Attendance";
import EmployeeProfile from "@/models/EmployeeProfile";
import { auth } from "@/lib/auth"; // Assuming auth setup exists
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user) {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const employee = await EmployeeProfile.findOne({ userId: session.user.id });
        if (!employee) {
            return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const history = searchParams.get('history');

        if (history === 'true') {
            const attendanceHistory = await Attendance.find({ employeeId: employee._id })
                .sort({ date: -1 })
                .limit(30); // Limit to last 30 entries for now
            return NextResponse.json({ success: true, attendance: attendanceHistory });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        return NextResponse.json({ success: true, attendance });
    } catch (error) {
        console.error("Error fetching attendance status:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch attendance status" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
             headers: await headers()
        });

        if (!session || !session.user) {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const employee = await EmployeeProfile.findOne({ userId: session.user.id });
        if (!employee) {
            return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
        }

        const body = await req.json();
        const { location, action } = body; // action: 'check-in' or 'check-out'

        if (!location || !location.latitude || !location.longitude) {
            return NextResponse.json({ success: false, error: "Location is required" }, { status: 400 });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (action === 'check-in') {
            if (attendance) {
                return NextResponse.json({ success: false, error: "Already checked in today" }, { status: 400 });
            }

            attendance = await Attendance.create({
                employeeId: employee._id,
                date: new Date(),
                checkInTime: new Date(),
                location: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    address: location.address
                },
                status: 'Present',
                approvalStatus: 'Approved' 
            });
        } else if (action === 'check-out') {
            if (!attendance) {
                return NextResponse.json({ success: false, error: "No check-in record found for today" }, { status: 400 });
            }
            
            if (attendance.checkOutTime) {
                 return NextResponse.json({ success: false, error: "Already checked out today" }, { status: 400 });
            }

            attendance.checkOutTime = new Date();
            await attendance.save();
        } else {
             return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({ success: true, attendance });

    } catch (error) {
        console.error("Error marking attendance:", error);
        return NextResponse.json({ success: false, error: "Failed to mark attendance" }, { status: 500 });
    }
}
