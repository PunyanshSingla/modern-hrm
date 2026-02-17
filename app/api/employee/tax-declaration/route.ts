import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TaxDeclaration from "@/models/TaxDeclaration";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        const declaration = await TaxDeclaration.findOne({ 
            employeeId: session.user.id, // Assuming session.user.id is the employee's ID link
            financialYear: "2024-25" 
        });

        return NextResponse.json({ success: true, declaration });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { regime, section80C, hra, otherSections } = body;

        await connectToDatabase();
        
        const declaration = await TaxDeclaration.findOneAndUpdate(
            { employeeId: session.user.id, financialYear: "2024-25" },
            { 
                regime, 
                section80C, 
                hra, 
                otherSections,
                isLocked: false // Reset lock on update
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, declaration });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
