import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Payroll from "@/models/Payroll";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function PATCH(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { ids, action, paymentDetails } = body;

        if (!ids || !Array.isArray(ids) || !action) {
            return NextResponse.json({ error: "Missing ids or action" }, { status: 400 });
        }

        await connectToDatabase();

        let update: any = {};
        if (action === 'Approve') {
            update = { 
                status: 'Approved', 
                approvedBy: session.user.id, 
                approvedAt: new Date() 
            };
        } else if (action === 'Pay') {
            update = { 
                status: 'Paid', 
                paymentDetails: {
                    ...paymentDetails,
                    paidAt: new Date()
                }
            };
        }

        const results = await Payroll.updateMany(
            { _id: { $in: ids } },
            { $set: update }
        );

        return NextResponse.json({ success: true, count: results.modifiedCount });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
