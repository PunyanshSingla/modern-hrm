import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Resignation from "@/models/Resignation";
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

        const resignations = await Resignation.find({ employeeId: employee._id })
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, resignations });
    } catch (error) {
        console.error("Error fetching resignations:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch resignations" }, { status: 500 });
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
        const { lastWorkingDay, reason, noticePeriod } = body;

        // Validation
        if (!lastWorkingDay || !reason) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Check if there is already a pending resignation
        const existingResignation = await Resignation.findOne({ 
            employeeId: employee._id, 
            status: 'Pending' 
        });

        if (existingResignation) {
            return NextResponse.json({ success: false, error: "You already have a pending resignation request" }, { status: 400 });
        }

        const resignationDate = new Date();
        const lastDay = new Date(lastWorkingDay);

        if (lastDay <= resignationDate) {
            return NextResponse.json({ success: false, error: "Last working day must be in the future" }, { status: 400 });
        }

        // Create Resignation Request
        const newResignation = await Resignation.create({
            employeeId: employee._id,
            resignationDate,
            lastWorkingDay: lastDay,
            reason,
            noticePeriod: noticePeriod || 30,
            status: 'Pending'
        });

        return NextResponse.json({ success: true, resignation: newResignation }, { status: 201 });

    } catch (error) {
        console.error("Error creating resignation:", error);
        return NextResponse.json({ success: false, error: "Failed to submit resignation" }, { status: 500 });
    }
}
