import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Resignation from "@/models/Resignation";
import EmployeeProfile from "@/models/EmployeeProfile";
import { auth } from "@/lib/auth";  
import { headers } from "next/headers";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: resignationId } = await context.params;
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user || session.user.role !== 'admin') {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status, adminRemarks, lastWorkingDay, exitInterviewDate, clearedByIT, clearedByFinance } = body;

        const resignation = await Resignation.findById(resignationId);
        if (!resignation) {
            return NextResponse.json({ success: false, error: "Resignation not found" }, { status: 404 });
        }

        if (status) resignation.status = status;
        if (adminRemarks !== undefined) resignation.adminRemarks = adminRemarks;
        if (lastWorkingDay) resignation.lastWorkingDay = new Date(lastWorkingDay);
        if (exitInterviewDate) resignation.exitInterviewDate = new Date(exitInterviewDate);
        if (clearedByIT !== undefined) resignation.clearedByIT = clearedByIT;
        if (clearedByFinance !== undefined) resignation.clearedByFinance = clearedByFinance;

        await resignation.save();

        // If status is changed to Approved, we might want to update the employee status as well in the future
        // or handle it when status becomes 'Completed'

        return NextResponse.json({ success: true, resignation });
    } catch (error) {
        console.error("Error updating resignation:", error);
        return NextResponse.json({ success: false, error: "Failed to update resignation" }, { status: 500 });
    }
}
