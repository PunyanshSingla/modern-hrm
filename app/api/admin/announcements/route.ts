import { NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/db";
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

export async function POST(req: Request) {
    try {
        const { title, content, priority, author } = await req.json();
        await connectToDatabase();
        const announcement = await Announcement.create({ title, content, priority, author });
        return NextResponse.json({ success: true, announcement });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
        
        await connectToDatabase();
        await Announcement.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
