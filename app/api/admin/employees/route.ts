
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import EmployeeProfile from "@/models/EmployeeProfile";
import "@/models/User"; // Ensure User model is registered
import { connectToDatabase } from "@/lib/db";
import { resend } from "@/lib/resend";
import { nanoid } from "nanoid";
import SendInviteEmployeeEmail from "@/emails/invite-employee";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { firstName, lastName, email, department, position } = body;

        if (!email || !department || !position) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await connectToDatabase();

        const tempPassword = nanoid(12);
        let user;

        try {
            user = await auth.api.signUpEmail({
                body: {
                    email,
                    password: tempPassword,
                    name: `${firstName} ${lastName}`
                },
                headers: await headers(),
                asResponse: false // We need the user object
            });
        } catch (e: any) {
            return NextResponse.json({ error: "User already exists or creation failed: " + e.message }, { status: 400 });
        }

        if (!user) {
            return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
        }

        // 2. Create Employee Profile
        const newProfile = await EmployeeProfile.create({
            userId: user.user.id,
            firstName,
            lastName,
            department,
            position,
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
        const session = await auth.api.getSession({ headers: await headers() });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        // Fetch profiles and populate user email/name
        const employees = await EmployeeProfile.find().populate('userId', 'email name image');

        return NextResponse.json({ success: true, employees });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
