
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import EmployeeProfile from "@/models/EmployeeProfile";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

// Handle /api/admin/employees/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        const profile = await EmployeeProfile.findById(id);
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }
        await connectToDatabase();
        await User.deleteOne({ _id: profile.userId });

        await EmployeeProfile.findByIdAndDelete(id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        await connectToDatabase();

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
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        const profile = await EmployeeProfile.findById(id).populate('userId', 'email name');
        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
