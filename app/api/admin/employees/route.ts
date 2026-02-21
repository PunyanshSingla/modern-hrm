
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import "@/models/EmployeeProfile";
import "@/models/Department";
import "@/models/User";
import EmployeeProfile from "@/models/EmployeeProfile";
import Department from "@/models/Department";
import { connectToDatabase } from "@/lib/db";
import { resend } from "@/lib/resend";
import { nanoid } from "nanoid";
import SendInviteEmployeeEmail from "@/emails/invite-employee";

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
        const { firstName, lastName, email, departmentId, position, baseSalary } = body;

        if (!email || !departmentId || !position || baseSalary === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const departmentDoc = await Department.findById(departmentId);
        if (!departmentDoc) {
             return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
        }

        const tempPassword = nanoid(12);
        let user;

        console.log("DEBUG: auth.api keys:", Object.keys(auth.api));

        try {
            // Use Admin API to create user without stripping the current session
            user = await auth.api.createUser({
                body: {
                    email,
                    password: tempPassword,
                    name: `${firstName} ${lastName}`,
                    role: "user"
                },
                headers: await headers()
            });
        } catch (e: any) {
            return NextResponse.json({ error: "User already exists or creation failed: " + (e.message || e.toString()) }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // 2. Create Employee Profile
        const newProfile = await EmployeeProfile.create({
            userId: user.user.id,
            firstName,
            lastName,
            departmentId: departmentDoc._id,
            department: departmentDoc.name,
            position,
            baseSalary: Number(baseSalary),
            status: 'invited',
            documents: [],
            experience: [],
            education: [],
            skills: [],
            certifications: []
        });

        await SendInviteEmployeeEmail(email, `${process.env.NEXT_PUBLIC_APP_URL}/login`, `${firstName} ${lastName}`, tempPassword);
        return NextResponse.json({ success: true, profile: newProfile });

    } catch (error: any) {
        console.error("Invite Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        await connectToDatabase();
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        // Fetch profiles and populate user email/name
        // Fetch profiles and populate user email/name and department
        const employees = await EmployeeProfile.find().populate('userId', 'email name image').populate({ path: 'departmentId', select: 'name', model: Department });

        return NextResponse.json({ success: true, employees });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
