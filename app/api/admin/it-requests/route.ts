import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import "@/models/EmployeeProfile";
import "@/models/Department";
import "@/models/User";
import ITRequest from "@/models/ITRequest";
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

        const requests = await ITRequest.find({})
            .populate({
                path: 'employeeId',
                select: 'firstName lastName userId departmentId position',
                populate: [
                    { path: 'userId', select: 'email' },
                    { path: 'departmentId', select: 'name' }
                ]
            })
            .sort({ createdAt: -1 });

        // Map fields for frontend
        const formattedRequests = requests.map((req: any) => {
            const reqObj = req.toObject();
            if (reqObj.employeeId) {
                reqObj.employeeId.jobTitle = reqObj.employeeId.position || "N/A";
                reqObj.employeeId.email = reqObj.employeeId.userId?.email || "";
                if (reqObj.employeeId.departmentId) {
                    reqObj.employeeId.department = reqObj.employeeId.departmentId.name;
                }
            }
            return reqObj;
        });

        return NextResponse.json({ success: true, requests: formattedRequests });
    } catch (error) {
        console.error("Error fetching IT requests:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch requests" }, { status: 500 });
    }
}
