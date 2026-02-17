import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import "@/models/EmployeeProfile";
import "@/models/LeaveType";
import "@/models/User";
import "@/models/Department";
import Leave from "@/models/Leave";

interface Context {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(req: NextRequest, context: Context) {
    try {
        const { id } = await context.params;
        await connectToDatabase();

        const leave = await Leave.findById(id).populate({
            path: 'employeeId',
            select: 'firstName lastName userId departmentId position leaveBalances mobile phone', 
            populate: [
                { path: 'departmentId', select: 'name' },
                { path: 'userId', select: 'email' },
                { path: 'leaveBalances.leaveTypeId', select: 'name color' }
            ]
        }).populate('leaveTypeId', 'name color');
        
        if (!leave) {
            return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
        }

        // Map position to jobTitle for frontend compatibility
        const leaveObj = leave.toObject() as any;
        if (leaveObj.employeeId) {
            leaveObj.employeeId.jobTitle = leaveObj.employeeId.position || "N/A";
            leaveObj.employeeId.email = leaveObj.employeeId.userId?.email || "";
        }

        return NextResponse.json({ success: true, leave: leaveObj });
    } catch (error) {
        console.error("Error fetching leave details:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch leave details" }, { status: 500 });
    }
}

import EmployeeProfile from "@/models/EmployeeProfile";
import { differenceInCalendarDays } from "date-fns";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectToDatabase();
        const body = await req.json();
        const { status, managerId, rejectionReason } = body;

        if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
             return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        // Fetch existing leave to check previous status
        const existingLeave = await Leave.findById(id);
        if (!existingLeave) {
            return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
        }

        // Calculate duration
        const startDate = new Date(existingLeave.startDate);
        const endDate = new Date(existingLeave.endDate);
        const duration = differenceInCalendarDays(endDate, startDate) + 1;

        // Handle Balance Updates
        if (status === 'Approved' && existingLeave.status !== 'Approved') {
            // Deduct balance
            await EmployeeProfile.findOneAndUpdate(
                { 
                    _id: existingLeave.employeeId,
                    "leaveBalances.leaveTypeId": existingLeave.leaveTypeId 
                },
                { 
                    $inc: { "leaveBalances.$.balance": -duration } 
                }
            );
        } else if (status === 'Rejected' && existingLeave.status === 'Approved') {
            // Revert balance (add back)
            await EmployeeProfile.findOneAndUpdate(
                { 
                    _id: existingLeave.employeeId,
                    "leaveBalances.leaveTypeId": existingLeave.leaveTypeId 
                },
                { 
                    $inc: { "leaveBalances.$.balance": duration } 
                }
            );
        }

        const updatedLeave = await Leave.findByIdAndUpdate(
            id,
            { 
                status, 
                managerId, // Optional: track who approved/rejected
                rejectionReason: status === 'Rejected' ? rejectionReason : undefined
            },
            { new: true }
        );

        return NextResponse.json({ success: true, leave: updatedLeave });
    } catch (error) {
        console.error("Error updating leave:", error);
        return NextResponse.json({ success: false, error: "Failed to update leave request" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectToDatabase();

        const deletedLeave = await Leave.findByIdAndDelete(id);

        if (!deletedLeave) {
            return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Leave request deleted successfully" });
    } catch (error) {
         console.error("Error deleting leave:", error);
        return NextResponse.json({ success: false, error: "Failed to delete leave request" }, { status: 500 });
    }
}
