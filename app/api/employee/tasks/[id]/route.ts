import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Task from "@/models/Task";
import EmployeeProfile from "@/models/EmployeeProfile";
import { auth } from "@/lib/auth";  
import { headers } from "next/headers";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: taskId } = await context.params;
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

        const body = await req.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
        }

        // Only allow updating status for tasks assigned to the employee or their department
        const task = await Task.findOneAndUpdate(
            { 
                _id: taskId, 
                $or: [
                    { assigneeIds: employee._id },
                    { departmentId: employee.departmentId }
                ]
            },
            { status },
            { new: true }
        );

        if (!task) {
            return NextResponse.json({ success: false, error: "Task not found or not assigned to you" }, { status: 404 });
        }

        return NextResponse.json({ success: true, task });
    } catch (error: any) {
        console.error("Error updating task status:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
