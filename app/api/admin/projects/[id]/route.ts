
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Project from "@/models/Project";
import EmployeeProfile from "@/models/EmployeeProfile";
import Department from "@/models/Department";
import "@/models/User"; // Side-effect for registration
import { connectToDatabase } from "@/lib/db";
import mongoose from "mongoose";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        const project = await Project.findById(id)
            .populate({ path: 'departmentId', select: 'name', model: Department })
            .populate('managerId', 'name email image')
            .populate({
                path: 'teamMembers',
                select: 'firstName lastName position userId',
                populate: {
                    path: 'userId',
                    select: 'email image'
                }
            });

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        let team = [...project.teamMembers];

        // If department is assigned, fetch department members
        if (project.departmentId) {
             const deptEmployees = await EmployeeProfile.find({ departmentId: project.departmentId._id })
                .populate('userId', 'email image')
                .select('firstName lastName position userId');
             
             // Merge lists avoiding duplicates (though logic should prevent duplicates if handled correctly)
             // Prioritize explicit assignment maybe? Or just show all.
             // For now, let's just return both lists or a unified list if UI handles it.
             // Let's attach full department list separately for clarity in UI?
             // Or better, let's keep `teamMembers` for explicitly assigned, and `departmentMembers` for implicit.
             
             return NextResponse.json({ 
                success: true, 
                project: {
                    ...project.toObject(),
                    departmentMembers: deptEmployees
                }
            });
        }

        return NextResponse.json({ success: true, project });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        
        // Exclude teamMembers from direct PUT if we want a separate endpoint for team management, 
        // but for simplicity, let's allow updating everything here except maybe basic details.
        // Actually, let's use a standard update.

        await connectToDatabase();

        const updatedProject = await Project.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true }
        );

        if (!updatedProject) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, project: updatedProject });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await connectToDatabase();

        const deletedProject = await Project.findByIdAndDelete(id);

        if (!deletedProject) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
