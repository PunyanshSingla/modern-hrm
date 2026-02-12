
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import EmployeeProfile from "@/models/EmployeeProfile";
import { connectToDatabase } from "@/lib/db";
import { ObjectId } from 'mongodb';

export async function GET() {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const profile = await EmployeeProfile.findOne({ userId: session.user.id });

        if (!profile) {
            return NextResponse.json({ error: "Profile not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, profile });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({ headers: await headers() });
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        await connectToDatabase();
        

        const updatedProfile = await EmployeeProfile.findOneAndUpdate(
            { userId: new ObjectId(session.user.id) },
            { $set: { ...body, status: 'onboarding' } },
            { new: true, runValidators: true }
        );

        console.log("Updated profile from DB:", JSON.stringify(updatedProfile, null, 2));

        return NextResponse.json({ success: true, profile: updatedProfile });
    } catch (error: any) {
        console.error("Error updating profile:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
