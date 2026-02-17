import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import ITRequest from "@/models/ITRequest";
import EmployeeProfile from "@/models/EmployeeProfile";
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

        const requests = await ITRequest.find({ employeeId: employee._id })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, requests });
    } catch (error) {
        console.error("Error fetching IT requests:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch requests" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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

        const body = await req.json();
        const { type, item, reason, priority } = body;

        if (!type || !item || !reason) {
             return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        const newRequest = await ITRequest.create({
            employeeId: employee._id,
            type,
            item,
            reason,
            priority: priority || 'Medium',
            requestDate: new Date()
        });

        return NextResponse.json({ success: true, request: newRequest });

    } catch (error) {
        console.error("Error creating IT request:", error);
        return NextResponse.json({ success: false, error: "Failed to create request" }, { status: 500 });
    }
}
