import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SalaryStructure from "@/models/SalaryStructure";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try {
        await connectToDatabase();
        const structures = await SalaryStructure.find().sort({ createdAt: -1 });
        return NextResponse.json({ success: true, structures });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await connectToDatabase();
        
        const structure = await SalaryStructure.create(body);
        return NextResponse.json({ success: true, structure });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
