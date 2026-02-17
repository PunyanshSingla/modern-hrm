import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import "@/models/EmployeeProfile";
import "@/models/Project";
import { auth } from "@/lib/auth";  
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user || session.user.role !== 'admin') {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const tasks = await Task.find({})
            .populate('assigneeIds', 'firstName lastName position')
            .populate('departmentId', 'name')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, tasks });
    } catch (error: any) {
        console.error("Error fetching admin tasks:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user || session.user.role !== 'admin') {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { title, description, assigneeIds, departmentId, projectId, priority, status, dueDate } = body;

        if (!title || (!assigneeIds?.length && !departmentId)) {
            return NextResponse.json({ success: false, error: "Title and at least one Assignee or Department are required" }, { status: 400 });
        }

        const newTask = await Task.create({
            title,
            description,
            assigneeIds: assigneeIds || [],
            departmentId: departmentId || undefined,
            projectId: projectId || undefined,
            priority: priority || 'Medium',
            status: status || 'To Do',
            dueDate: dueDate ? new Date(dueDate) : undefined
        });

        return NextResponse.json({ success: true, task: newTask }, { status: 201 });
    } catch (error: any) {
        console.error("Error creating task:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
