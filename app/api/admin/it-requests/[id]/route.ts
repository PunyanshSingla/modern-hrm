import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import "@/models/EmployeeProfile";
import "@/models/Department";
import "@/models/User";
import ITRequest from "@/models/ITRequest";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user || session.user.role !== 'admin') {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const request = await ITRequest.findById(id).populate({
            path: 'employeeId',
            select: 'firstName lastName userId departmentId position',
            populate: [
                { path: 'userId', select: 'email image' },
                { path: 'departmentId', select: 'name' }
            ]
        });

        if (!request) {
            return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
        }

        // Map fields for frontend
        const requestObj = request.toObject() as any;
        if (requestObj.employeeId) {
            requestObj.employeeId.jobTitle = requestObj.employeeId.position || "N/A";
            requestObj.employeeId.email = requestObj.employeeId.userId?.email || "";
            if (requestObj.employeeId.departmentId) {
                requestObj.employeeId.department = requestObj.employeeId.departmentId.name;
            }
        }

        return NextResponse.json({ success: true, request: requestObj });

    } catch (error) {
        console.error("Error fetching IT request details:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch request details" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user || session.user.role !== 'admin') {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, rejectionReason } = body;

        let updateData: any = { status };
        if (status === 'Rejected') {
            updateData.rejectionReason = rejectionReason;
        }

        const request = await ITRequest.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).populate('employeeId', 'firstName lastName');

        if (!request) {
            return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, request });

    } catch (error) {
        console.error("Error updating IT request:", error);
        return NextResponse.json({ success: false, error: "Failed to update request" }, { status: 500 });
    }
}
