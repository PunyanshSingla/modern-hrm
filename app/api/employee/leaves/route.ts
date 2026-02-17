import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Leave from "@/models/Leave";
import EmployeeProfile from "@/models/EmployeeProfile";
import "@/models/LeaveType"; // Register LeaveType schema
import { auth } from "@/lib/auth";  
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

        const leaves = await Leave.find({ employeeId: employee._id })
            .populate('leaveTypeId', 'name color')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, leaves });
    } catch (error) {
        console.error("Error fetching leaves:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch leaves" }, { status: 500 });
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
        const { leaveTypeId, startDate, endDate, reason } = body;

        // Validation
        if (!leaveTypeId || !startDate || !endDate || !reason) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return NextResponse.json({ success: false, error: "Start date must be before end date" }, { status: 400 });
        }

        // Create Leave Request
        const newLeave = await Leave.create({
            employeeId: employee._id,
            leaveTypeId,
            startDate: start,
            endDate: end,
            reason,
            status: 'Pending'
        });

        return NextResponse.json({ success: true, leave: newLeave }, { status: 201 });

    } catch (error) {
        console.error("Error creating leave:", error);
        return NextResponse.json({ success: false, error: "Failed to create leave request" }, { status: 500 });
    }
}
