
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import "@/models/EmployeeProfile";
import "@/models/Department";
import "@/models/User";
import "@/models/Leave";
import "@/models/ITRequest";
import EmployeeProfile from "@/models/EmployeeProfile";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

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

        // Fetch Leaves
        const Leave = (await import("@/models/Leave")).default;
        await (await import("@/models/LeaveType")).default; // Ensure LeaveType is registered
        const leaves = await Leave.find({ employeeId: id })
            .populate('leaveTypeId', 'name')
            .sort({ createdAt: -1 });

        // Fetch IT Requests
        const ITRequest = (await import("@/models/ITRequest")).default;
        const itRequests = await ITRequest.find({ employeeId: id }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, profile, leaves, itRequests });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
