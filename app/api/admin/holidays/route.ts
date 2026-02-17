import { NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/db";
import Holiday from "@/models/Holiday";

export async function GET() {
    try {
        await connectToDatabase();
        const holidays = await Holiday.find({}).sort({ date: 1 });
        return NextResponse.json({ success: true, holidays });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, date, type } = await req.json();
        await connectToDatabase();
        const holiday = await Holiday.create({ name, date, type });
        return NextResponse.json({ success: true, holiday });
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
        await Holiday.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
