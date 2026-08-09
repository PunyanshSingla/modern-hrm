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

        let profile = await EmployeeProfile.findOne({ userId: session.user.id })
            .populate({
                path: 'leaveBalances.leaveTypeId',
                model: 'LeaveType'
            });
        
        if (!profile) {
            return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
        }

        // If leave balances are empty, auto-initialize from active LeaveTypes
        if (!profile.leaveBalances || profile.leaveBalances.length === 0) {
            const allLeaveTypes = await LeaveType.find({});
            if (allLeaveTypes.length > 0) {
                profile.leaveBalances = allLeaveTypes.map(lt => ({
                    leaveTypeId: lt._id,
                    balance: lt.defaultAllowance || 12,
                    used: 0
                }));
                await profile.save();
                // Re-populate leaveTypeId
                profile = await EmployeeProfile.findOne({ userId: session.user.id })
                    .populate({
                        path: 'leaveBalances.leaveTypeId',
                        model: 'LeaveType'
                    });
            }
        }

        const validBalances = (profile?.leaveBalances || []).filter(
            (b: any) => b.leaveTypeId !== null && b.leaveTypeId !== undefined
        );
        return NextResponse.json({ success: true, balances: validBalances, leaveBalances: validBalances });
    } catch (error: any) {
        console.error("Leave balances error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
