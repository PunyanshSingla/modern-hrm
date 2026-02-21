
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import "@/models/Project";
import "@/models/EmployeeProfile";
import "@/models/Department";
import "@/models/User";
import Project from "@/models/Project";
import Department from "@/models/Department";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const projects = await Project.find()
            .populate({ path: 'departmentId', select: 'name', model: Department })
            .populate('managerId', 'name email image')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, status, startDate, endDate, departmentId, managerId } = body;

        if (!name || !startDate || !endDate) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const newProject = await Project.create({
            name,
            description,
            status: status || 'Planned',
            startDate,
            endDate,
            departmentId: departmentId || undefined,
            managerId: managerId || undefined,
            teamMembers: []
        });

        return NextResponse.json({ success: true, project: newProject });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
