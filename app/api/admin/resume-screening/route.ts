import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import * as z from "zod";


export const runtime = "nodejs"; // Prevent accidental Edge deployment
export const maxDuration = 60; // Allow enough time for AI processing

const analysisSchema = z.object({
  candidateName: z.string(),
  score: z.number().min(0).max(100),
  summary: z.string(),
  pros: z.array(z.string()),
  cons: z.array(z.string()),
  skills: z.array(z.string()),
  experienceYears: z.number().optional(),
  education: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Dynamically import pdf-parse v1.x (function-based API)
    const pdf = (await import("pdf-parse")).default;

    console.log("Starting resume screening process...");
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || (session.user as any).role !== "admin") {
      console.log("Unauthorized access attempt to resume screening.");
      return NextResponse.json({ error: "Unauthorized access: Admin role required" }, { status: 401 });
    }

    let formData;
    try {
      formData = await req.formData();
    } catch (err: any) {
      console.error("Failed to parse form data:", err);
      return NextResponse.json({ error: "Failed to process upload. Re-check file sizes." }, { status: 400 });
    }

    const files = formData.getAll("files") as File[];
    const role = formData.get("role") as string || "General Role";
    const skills = formData.get("skills") as string || "";
    const description = formData.get("description") as string || "";

    console.log(`Processing ${files.length} files for role: ${role}`);

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const results = await Promise.all(
      files.map(async (file) => {
        try {
          console.log(`Analyzing file: ${file.name}`);
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Use pdf-parse v1.x function API
          const data = await pdf(buffer);
          const text = data.text;

          if (!text || text.trim().length === 0) {
            throw new Error("Could not extract readable text from this PDF file.");
          }

          const { object } = await generateObject({
            // Reverting to 1.5-flash as 2.5 does not exist and causes 500 errors
            model: google("gemini-2.5-flash"), 
            schema: analysisSchema,
            prompt: `
              Analyze the following resume specifically for the role of: "${role}".
              
              Target Skills: ${skills}
              Role Responsibilities/Description: ${description}
              
              Role Details/Requirements: Screen strictly based on the technical skills, experience, and activities described for a "${role}".
              
              Rate the candidate based on:
              1. Relevance of experience to "${role}" and its responsibilities.
              2. Technical skills match for "${role}" (specifically looking for: ${skills}).
              3. Practical experience in performing the described job activities.
              4. Education and professional certifications.
              
              A score of 100 means a perfect match for the specific role and skills.
              A score below 50 means the candidate is likely not suitable for this specific role.
              
              RESUME TEXT:
              ${text}
            `,
          });

          console.log(`Successfully analyzed ${file.name}`);
          return {
            fileName: file.name,
            success: true,
            analysis: object,
          };
        } catch (error: any) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            fileName: file.name,
            success: false,
            error: error.message || "Failed to process resume",
          };
        }
      })
    );

    console.log("Resume screening completed successfully.");
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error("CRITICAL: Resume screening error:", error);
    return NextResponse.json(
      { error: "Internal server error during resume screening", details: error.message },
      { status: 500 }
    );
  }
}
