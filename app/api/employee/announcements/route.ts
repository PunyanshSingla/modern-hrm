import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Announcement from "@/models/Announcement";

export async function GET() {
    try {
        await connectToDatabase();
        const announcements = await Announcement.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, announcements });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
