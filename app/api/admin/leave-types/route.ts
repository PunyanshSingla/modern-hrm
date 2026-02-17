import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import LeaveType from "@/models/LeaveType";

// Handle /api/admin/leave-types
export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const leaveTypes = await LeaveType.find().sort({ name: 1 });
        return NextResponse.json({ success: true, leaveTypes });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectToDatabase();

        const newType = await LeaveType.create(body);
        return NextResponse.json({ success: true, leaveType: newType });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
