import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import EmployeeProfile from "@/models/EmployeeProfile";
import "@/models/Project";
import { auth } from "@/lib/auth";  
import { headers } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user) {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const employee = await EmployeeProfile.findOne({ userId: session.user.id });
        if (!employee) {
            return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
        }

        // Fetch tasks assigned to this employee OR to their department
        const tasks = await Task.find({
            $or: [
                { assigneeIds: employee._id },
                { departmentId: employee.departmentId }
            ]
        })
            .populate('projectId', 'name')
            .sort({ dueDate: 1, createdAt: -1 });

        return NextResponse.json({ success: true, tasks });
    } catch (error: any) {
        console.error("Error fetching employee tasks:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
