import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Project from "@/models/Project";
import EmployeeProfile from "@/models/EmployeeProfile";
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
        
        // Find employee profile to get their ID
        const profile = await EmployeeProfile.findOne({ userId: session.user.id });
        if (!profile) {
            return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
        }

        // Find projects where the employee is in teamMembers
        const projects = await Project.find({
            teamMembers: profile._id
        }).populate('departmentId', 'name').sort({ updatedAt: -1 });

        return NextResponse.json({ success: true, projects });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
