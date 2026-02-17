import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Resignation from "@/models/Resignation";
import "@/models/EmployeeProfile"; // Register EmployeeProfile schema
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

        const resignations = await Resignation.find({})
            .populate({
                path: 'employeeId',
                select: 'firstName lastName position departmentId department',
                populate: {
                    path: 'departmentId',
                    select: 'name'
                }
            })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, resignations });
    } catch (error) {
        console.error("Error fetching admin resignations:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch resignations" }, { status: 500 });
    }
}
