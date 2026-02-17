import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
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
