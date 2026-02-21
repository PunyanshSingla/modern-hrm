import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import EmployeeProfile from "@/models/EmployeeProfile";
import Department from "@/models/Department";
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

        const employee = await EmployeeProfile.findOne({ userId: session.user.id })
            .populate({ path: 'departmentId', select: 'name', model: Department });
            
        if (!employee) {
            return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile: employee });
    } catch (error) {
        console.error("Error fetching employee profile:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || !session.user) {
             return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { 
            phone, 
            address, 
            bankDetails, 
            skills,
            experience,
            education,
            documents,
            certifications
        } = body;

        // Find and update
        const employee = await EmployeeProfile.findOneAndUpdate(
            { userId: session.user.id },
            {
                $set: {
                    phone,
                    address,
                    bankDetails,
                    skills,
                    experience,
                    education,
                    documents,
                    certifications
                }
            },
            { new: true } // Return updated document
        );

        if (!employee) {
            return NextResponse.json({ success: false, error: "Employee profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile: employee });

    } catch (error) {
        console.error("Error updating employee profile:", error);
        return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    return PUT(req);
}
