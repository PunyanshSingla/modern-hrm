
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Department from "@/models/Department";
import EmployeeProfile from "@/models/EmployeeProfile";
import { connectToDatabase } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        const department = await Department.findById(id).populate('managerId', 'name email image');
        if (!department) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        // Get employee stats
        const employeeCount = await EmployeeProfile.countDocuments({ departmentId: id });
        // Get employees in this department
        const employees = await EmployeeProfile.find({ departmentId: id })
            .populate('userId', 'name email image')
            .select('firstName lastName position status userId');

        return NextResponse.json({ 
            success: true, 
            department: {
                ...department.toObject(),
                employeeCount,
                employees
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { name, description, managerId } = body;

        await connectToDatabase();

        const updatedDepartment = await Department.findByIdAndUpdate(
            id,
            { name, description, managerId },
            { new: true }
        );

        if (!updatedDepartment) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, department: updatedDepartment });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        // Check if there are employees in this department
        const employeeCount = await EmployeeProfile.countDocuments({ departmentId: id });
        if (employeeCount > 0) {
            return NextResponse.json({ 
                error: `Cannot delete department. There are ${employeeCount} employees assigned to it.` 
            }, { status: 400 });
        }

        const deletedDepartment = await Department.findByIdAndDelete(id);

        if (!deletedDepartment) {
            return NextResponse.json({ error: "Department not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
