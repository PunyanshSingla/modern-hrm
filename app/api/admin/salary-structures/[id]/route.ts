import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SalaryStructure from "@/models/SalaryStructure";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectToDatabase();
        const structure = await SalaryStructure.findById(id);
        if (!structure) {
            return NextResponse.json({ success: false, error: "Structure not found" }, { status: 404 });
        }
        return NextResponse.json({ success: true, structure });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        await connectToDatabase();
        
        const structure = await SalaryStructure.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ success: true, structure });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();
        
        await SalaryStructure.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
