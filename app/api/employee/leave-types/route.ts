import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import LeaveType from "@/models/LeaveType";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// Read-only endpoint accessible to any authenticated user (employees)
export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const leaveTypes = await LeaveType.find().sort({ name: 1 }).lean();

        return NextResponse.json({ success: true, leaveTypes });
    } catch (error: any) {
        console.error("Employee leave-types error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
