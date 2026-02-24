import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Department from "@/models/Department";
import EmployeeProfile from "@/models/EmployeeProfile";
import { connectToDatabase } from "@/lib/db";

export async function GET() {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Use aggregation to get departments with employee counts
        const departments = await Department.aggregate([
            {
                $lookup: {
                    from: "employeeprofiles",
                    localField: "_id",
                    foreignField: "departmentId",
                    as: "employees"
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    createdAt: 1,
                    leaveBalances: 1,
                    employeeCount: { $size: "$employees" }
                }
            },
            { $sort: { createdAt: -1 } }
        ]);

        const totalEmployees = departments.reduce((acc, dept) => acc + dept.employeeCount, 0);
        const totalDepartments = departments.length;
        const avgDeptSize = totalDepartments > 0 ? Math.round(totalEmployees / totalDepartments) : 0;

        return NextResponse.json({ 
            success: true, 
            departments,
            stats: {
                totalDepartments,
                totalEmployees,
                avgDeptSize
            }
        });
    } catch (error: any) {
        console.error("Departments GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, description, managerId, leaveBalances } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }
        
        // Check for duplicate name
        const existingDefault = await Department.findOne({ name });
        if (existingDefault) {
             return NextResponse.json({ error: "Department with this name already exists" }, { status: 400 });
        }

        const newDepartment = await Department.create({
            name,
            description,
            leaveBalances,
            managerId: managerId === "" ? null : managerId
        });

        return NextResponse.json({ success: true, department: newDepartment });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
