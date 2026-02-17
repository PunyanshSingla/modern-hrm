import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Attendance from "@/models/Attendance";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectToDatabase();
        const body = await req.json();
        const { approvalStatus, rejectionReason } = body;

        if (!approvalStatus || !['Approved', 'Rejected'].includes(approvalStatus)) {
             return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
        }

        if (approvalStatus === 'Rejected' && !rejectionReason) {
            return NextResponse.json({ success: false, error: "Rejection reason is required" }, { status: 400 });
        }

        const updatedAttendance = await Attendance.findByIdAndUpdate(
            id,
            { 
                approvalStatus, 
                rejectionReason: approvalStatus === 'Rejected' ? rejectionReason : undefined
            },
            { new: true }
        );

        if (!updatedAttendance) {
            return NextResponse.json({ success: false, error: "Attendance record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, attendance: updatedAttendance });
    } catch (error) {
        console.error("Error updating attendance:", error);
        return NextResponse.json({ success: false, error: "Failed to update attendance record" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectToDatabase();

        const deletedAttendance = await Attendance.findByIdAndDelete(id);

        if (!deletedAttendance) {
            return NextResponse.json({ success: false, error: "Attendance record not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: "Attendance record deleted successfully" });
    } catch (error) {
         console.error("Error deleting attendance:", error);
        return NextResponse.json({ success: false, error: "Failed to delete attendance record" }, { status: 500 });
    }
}
