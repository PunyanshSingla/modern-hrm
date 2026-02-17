import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import "@/models/EmployeeProfile";
import "@/models/LeaveType";
import "@/models/User";
import "@/models/Department";
import Leave from "@/models/Leave";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        
        const leaves = await Leave.find({})
            .populate({
                path: 'employeeId',
                select: 'firstName lastName userId departmentId position',
                populate: [
                    {
                        path: 'userId',
                        select: 'email'
                    },
                    {
                        path: 'departmentId',
                        select: 'name'
                    }
                ]
            })
            .populate('leaveTypeId', 'name color')
            .sort({ createdAt: -1 });

        // Map fields for frontend compatibility
        const formattedLeaves = leaves.map((leave: any) => {
            const leaveObj = leave.toObject();
            if (leaveObj.employeeId) {
                leaveObj.employeeId.jobTitle = leaveObj.employeeId.position || "N/A";
                leaveObj.employeeId.email = leaveObj.employeeId.userId?.email || "";
            }
            return leaveObj;
        });

        return NextResponse.json({ success: true, leaves: formattedLeaves });
    } catch (error) {
        console.error("Error fetching leaves:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch leaves" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const body = await req.json();
        
        const { employeeId, leaveTypeId, startDate, endDate, reason } = body;

        // Basic validation
        if (!employeeId || !leaveTypeId || !startDate || !endDate || !reason) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Validate dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start > end) {
             return NextResponse.json({ success: false, error: "Start date must be before end date" }, { status: 400 });
        }

        const newLeave = await Leave.create({
            employeeId,
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
