
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
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
        const departments = await Department.find().sort({ createdAt: -1 });

        return NextResponse.json({ success: true, departments });
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
        const { name, description, managerId } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        await connectToDatabase();
        
        // Check for duplicate name
        const existingDefault = await Department.findOne({ name });
        if (existingDefault) {
             return NextResponse.json({ error: "Department with this name already exists" }, { status: 400 });
        }

        const newDepartment = await Department.create({
            name,
            description,
            managerId
        });

        return NextResponse.json({ success: true, department: newDepartment });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
