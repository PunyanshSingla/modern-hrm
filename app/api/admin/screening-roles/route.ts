import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import ScreeningRole from "@/models/ScreeningRole";
import { connectToDatabase } from "@/lib/db";

const PREDEFINED_ROLES = [
  {
    name: "Frontend Developer",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux"],
    description: "Develop responsive, high-performance user interfaces. Collaborate with designers and ensure web accessibility.",
    isPredefined: true
  },
  {
    name: "Backend Developer",
    skills: ["Node.js", "PostgreSQL", "Mongoose", "Redis", "Rest API"],
    description: "Build scalable server-side systems, manage database architecture, and ensure high availability and security.",
    isPredefined: true
  },
  {
    name: "Fullstack Engineer",
    skills: ["React", "Node.js", "MongoDB", "Auth.js", "AWS"],
    description: "Handle both client-side and server-side development. Design end-to-end features and manage deployments.",
    isPredefined: true
  },
  {
    name: "UI/UX Designer",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    description: "Create user-centric designs, conduct research, and prototype interactive high-fidelity mockups.",
    isPredefined: true
  },
  {
    name: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "Azure"],
    description: "Automate delivery pipelines, manage cloud infrastructure, and improve system reliability and monitoring.",
    isPredefined: true
  },
  {
    name: "Product Manager",
    skills: ["Agile/Scrum", "Roadmapping", "SQL", "Stakeholder Management"],
    description: "Define product vision, prioritize backlogs, and coordinate across teams to deliver maximum value.",
    isPredefined: true
  },
  {
    name: "Data Scientist",
    skills: ["Python", "TensorFlow", "Pandas", "Scikit-learn", "Tableau"],
    description: "Extract insights from complex datasets, build machine learning models, and create data visualizations.",
    isPredefined: true
  },
  {
    name: "HR Manager",
    skills: ["Talent Acquisition", "Conflict Resolution", "Employee Relations"],
    description: "Oversee recruitment processes, manage employee lifecycle, and ensure a healthy company culture.",
    isPredefined: true
  }
];

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session || (session.user as any).role !== "admin") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectToDatabase();
        
        // Seed if empty
        const count = await ScreeningRole.countDocuments();
        if (count === 0) {
            await ScreeningRole.insertMany(PREDEFINED_ROLES);
        }

        const roles = await ScreeningRole.find().sort({ isPredefined: -1, name: 1 });
        return NextResponse.json({ success: true, roles });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
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
        const { name, skills, description } = body;

        if (!name || !skills || !description) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        await connectToDatabase();
        
        const existing = await ScreeningRole.findOne({ name });
        if (existing) {
            return NextResponse.json({ error: "Role with this name already exists" }, { status: 400 });
        }

        const role = await ScreeningRole.create({
            name,
            skills: Array.isArray(skills) ? skills : skills.split(",").map((s: string) => s.trim()),
            description,
            isPredefined: false
        });

        return NextResponse.json({ success: true, role });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
