
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import EmployeeProfile from "@/models/EmployeeProfile";
import Department from "@/models/Department";
import User from "@/models/User";
import Leave from "@/models/Leave";
import LeaveType from "@/models/LeaveType";
import ITRequest from "@/models/ITRequest";

// Handle /api/admin/employees/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        
        const profile = await EmployeeProfile.findById(id);
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }
        await User.deleteOne({ _id: profile.userId });

        await EmployeeProfile.findByIdAndDelete(id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        // If leave balances are being updated manually, mark it as overridden
        if (body.leaveBalances) {
            body.isLeaveBalanceOverridden = true;
        }

        const updatedProfile = await EmployeeProfile.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedProfile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile: updatedProfile });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        
        const profile = await EmployeeProfile.findById(id).populate('userId', 'email name');
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        // Ensure LeaveType model registered before population
        const leaves = await Leave.find({ employeeId: id })
            .populate('leaveTypeId', 'name')
            .sort({ createdAt: -1 });

        const itRequests = await ITRequest.find({ employeeId: id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, profile, leaves, itRequests });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
