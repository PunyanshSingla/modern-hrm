
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    let debugInfo: any = {};
    try {
        const mongoose = await import("mongoose");
        await mongoose.connect(process.env.MONGODB_URI!);
        
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection failed");
        }

        // Delete existing admin user if exists
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Try 'user' and 'users'
        let existingUser = await db.collection("user").findOne({ email: "admin@hrm.com" });
        let usedCollection = "user";
        
        if (!existingUser) {
             existingUser = await db.collection("users").findOne({ email: "admin@hrm.com" });
             usedCollection = "users";
        }
        
        // Also check if email is stored differently (case sensitvity?)
        // Regex search
        if (!existingUser) {
            existingUser = await db.collection("user").findOne({ email: { $regex: new RegExp("^admin@hrm.com$", "i") } });
             if (existingUser) usedCollection = "user";
        }

        debugInfo = {
            collectionNames,
            foundUser: !!existingUser,
            usedCollection,
            existingUserId: existingUser?._id,
            mongoUri: process.env.MONGODB_URI ? "Has URI" : "No URI"
        };

        if (existingUser) {
            await db.collection(usedCollection).deleteOne({ _id: existingUser._id });
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
        
        return NextResponse.json({ success: true, user, debugInfo });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, debugInfo }, { status: 200 });
    }
}
