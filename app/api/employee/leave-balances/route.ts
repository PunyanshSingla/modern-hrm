import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import EmployeeProfile from "@/models/EmployeeProfile";
import LeaveType from "@/models/LeaveType"; // Ensure registered
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        
        // Ensure LeaveType model is registered
        const _dummy = LeaveType.findOne();

        const profile = await EmployeeProfile.findOne({ userId: session.user.id })
            .populate({
                path: 'leaveBalances.leaveTypeId',
                model: 'LeaveType'
            });
        
        if (!profile) {
            return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, balances: profile.leaveBalances });
    } catch (error: any) {
        console.error("Leave balances error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
