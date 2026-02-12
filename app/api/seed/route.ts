
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const mongoose = await import("mongoose");
        await mongoose.connect(process.env.MONGODB_URI!);
        
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection failed");
        }

        // Delete existing admin user if exists
        const existingUser = await db.collection("user").findOne({ email: "admin@hrm.com" });
        
        if (existingUser) {
            await db.collection("user").deleteOne({ _id: existingUser._id });
            await db.collection("account").deleteMany({ userId: existingUser._id.toString() });
            await db.collection("session").deleteMany({ userId: existingUser._id.toString() });
        }
        
        // Also clean up EmployeeProfile
        const EmployeeProfile = (await import("@/models/EmployeeProfile")).default;
        await EmployeeProfile.deleteOne({ email: "admin@hrm.com" });

        const user = await auth.api.signUpEmail({
            body: {
                email: "admin@hrm.com",
                password: "admin123",
                name: "Admin User",
                role: "admin"
            },
            headers: await headers()
        });
        
        return NextResponse.json({ success: true, user });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
