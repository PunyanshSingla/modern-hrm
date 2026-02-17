import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import LeaveType from "@/models/LeaveType";

// Handle /api/admin/leave-types/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        await connectToDatabase();

        const updatedType = await LeaveType.findByIdAndUpdate(id, body, { new: true });
        if (!updatedType) {
            return NextResponse.json({ error: "Leave type not found" }, { status: 404 });
        }
        
        return NextResponse.json({ success: true, leaveType: updatedType });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        const deletedType = await LeaveType.findByIdAndDelete(id);
        if (!deletedType) {
             return NextResponse.json({ error: "Leave type not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
