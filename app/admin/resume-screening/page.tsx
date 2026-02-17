"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Upload, 
  Loader2, 
  Briefcase,
  Plus,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  Search,
  Check
} from "lucide-react";
import { toast } from "sonner";
import React from "react";
import { useRouter } from "next/navigation";
import { saveScreeningResults } from "@/lib/indexed-db";

const PREDEFINED_ROLES = [
  {
    name: "Frontend Developer",
    skills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Redux"],
    description: "Develop responsive, high-performance user interfaces. Collaborate with designers and ensure web accessibility."
  },
  {
    name: "Backend Developer",
    skills: ["Node.js", "PostgreSQL", "Mongoose", "Redis", "Rest API"],
    description: "Build scalable server-side systems, manage database architecture, and ensure high availability and security."
  },
  {
    name: "Fullstack Engineer",
    skills: ["React", "Node.js", "MongoDB", "Auth.js", "AWS"],
    description: "Handle both client-side and server-side development. Design end-to-end features and manage deployments."
  },
  {
    name: "UI/UX Designer",
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
    description: "Create user-centric designs, conduct research, and prototype interactive high-fidelity mockups."
  },
  {
    name: "DevOps Engineer",
    skills: ["Docker", "Kubernetes", "CI/CD", "Terraform", "Azure"],
    description: "Automate delivery pipelines, manage cloud infrastructure, and improve system reliability and monitoring."
  },
  {
    name: "Product Manager",
    skills: ["Agile/Scrum", "Roadmapping", "SQL", "Stakeholder Management"],
    description: "Define product vision, prioritize backlogs, and coordinate across teams to deliver maximum value."
  },
  {
    name: "Data Scientist",
    skills: ["Python", "TensorFlow", "Pandas", "Scikit-learn", "Tableau"],
    description: "Extract insights from complex datasets, build machine learning models, and create data visualizations."
  },
  {
    name: "HR Manager",
    skills: ["Talent Acquisition", "Conflict Resolution", "Employee Relations"],
    description: "Oversee recruitment processes, manage employee lifecycle, and ensure a healthy company culture."
  }
];

export default function ResumeScreeningPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(PREDEFINED_ROLES[0]);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRole, setCustomRole] = useState("");
  const [customSkills, setCustomSkills] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(file => file.type === "application/pdf");
      if (newFiles.length < e.target.files.length) {
        toast.warning("Only PDF files are supported. Some files were skipped.");
      }
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const currentRole = isCustomRole ? customRole : selectedRole.name;
  const currentSkills = isCustomRole ? customSkills : selectedRole.skills.join(", ");
  const currentDescription = isCustomRole ? customDescription : selectedRole.description;

  const handleScreening = async () => {
    if (files.length === 0) {
      toast.error("Please upload at least one resume.");
      return;
    }

    if (isCustomRole && !customRole.trim()) {
      toast.error("Please enter a custom role name.");
      return;
    }

    setLoading(true);
    
    const formData = new FormData();
    files.forEach(file => formData.append("files", file));
    formData.append("role", currentRole);
    formData.append("skills", currentSkills);
    formData.append("description", currentDescription);

    try {
      const res = await fetch("/api/admin/resume-screening", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        // Convert files to base64 to store in localStorage for previewing
        const resultsWithFiles = await Promise.all(data.results.map(async (result: any) => {
          const file = files.find(f => f.name === result.fileName);
          if (file) {
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });
            return { ...result, fileData: base64 };
          }
          return result;
        }));

        await saveScreeningResults(resultsWithFiles);
        toast.success("Analysis complete! Redirecting to results...");
        
        // Wait a small bit for the toast
        setTimeout(() => {
          router.push(`/admin/resume-screening/results?role=${encodeURIComponent(currentRole)}`);
        }, 1000);
      } else {
        toast.error(data.error || "Failed to screen resumes.");
      }
    } catch (error) {
      console.error("Screening error:", error);
      toast.error("An error occurred during screening.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto h-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-4">
          <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
            <Sparkles className="h-3 w-3 mr-2" /> Powered by AI
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-[0.9]">
            RESUME <span className="text-primary italic">INTELLIGENCE</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl font-medium leading-snug">
            Advanced neural screening for modern talent acquisition. Precision scoring tailored to your specific organizational roles.
          </p>
        </div>
        
        <div className="hidden lg:grid grid-cols-2 gap-4">
            <div className="p-4 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-1 min-w-[140px]">
                <Zap className="h-5 w-5 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-tighter">Real-time</span>
                <span className="text-[10px] text-muted-foreground">Analysis</span>
            </div>
            <div className="p-4 rounded-3xl bg-card border border-border shadow-sm flex flex-col items-center justify-center text-center space-y-1 min-w-[140px]">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-xs font-bold uppercase tracking-tighter">Precision</span>
                <span className="text-[10px] text-muted-foreground">Matching</span>
            </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-5 items-start">
        {/* Step 1: Role Selection */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">1</div>
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Define the Role</h3>
                    <p className="text-sm text-muted-foreground font-medium">What position are you hiring for?</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                    {PREDEFINED_ROLES.map((role) => (
                        <Button
                            key={role.name}
                            variant={!isCustomRole && selectedRole.name === role.name ? "default" : "outline"}
                            className={`justify-start h-12 rounded-2xl border-2 transition-all duration-300 ${
                                !isCustomRole && selectedRole.name === role.name 
                                ? "border-primary shadow-md shadow-primary/10 scale-[1.02]" 
                                : "hover:border-primary/50"
                            }`}
                            onClick={() => {
                                setIsCustomRole(false);
                                setSelectedRole(role);
                            }}
                        >
                            <Briefcase className={`mr-2 h-4 w-4 ${!isCustomRole && selectedRole.name === role.name ? "animate-pulse" : "text-muted-foreground"}`} />
                            <span className="truncate">{role.name}</span>
                            {!isCustomRole && selectedRole.name === role.name && <Check className="ml-auto h-4 w-4" />}
                        </Button>
                    ))}
                    <Button
                        variant={isCustomRole ? "default" : "outline"}
                        className={`justify-start h-12 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                            isCustomRole 
                            ? "border-primary bg-primary/5 text-primary shadow-md" 
                            : "hover:border-primary/50 text-muted-foreground"
                        }`}
                        onClick={() => setIsCustomRole(true)}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Custom Role
                        {isCustomRole && <Check className="ml-auto h-4 w-4" />}
                    </Button>
                </div>

                {isCustomRole ? (
                    <div className="pt-2 space-y-4 animate-in slide-in-from-top-4 duration-300">
                        <div>
                            <Label htmlFor="custom-role" className="text-xs font-black uppercase text-muted-foreground mb-2 block tracking-widest pl-1">Name of Custom Role</Label>
                            <div className="relative">
                                <Input
                                    id="custom-role"
                                    placeholder="e.g. Senior Cloud Architect"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    className="h-14 rounded-2xl border-2 border-primary/20 focus-visible:ring-primary pl-12 text-lg font-bold"
                                />
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="custom-skills" className="text-xs font-black uppercase text-muted-foreground mb-2 block tracking-widest pl-1">Key Skills Required</Label>
                            <Input
                                id="custom-skills"
                                placeholder="React, Node.js, etc."
                                value={customSkills}
                                onChange={(e) => setCustomSkills(e.target.value)}
                                className="h-12 rounded-2xl border-2 border-primary/10"
                            />
                        </div>
                        <div>
                            <Label htmlFor="custom-desc" className="text-xs font-black uppercase text-muted-foreground mb-2 block tracking-widest pl-1">Role Description / Screening Criteria</Label>
                            <textarea
                                id="custom-desc"
                                placeholder="What activities should the candidate be proficient in?"
                                value={customDescription}
                                onChange={(e) => setCustomDescription(e.target.value)}
                                className="w-full min-h-[100px] rounded-2xl border-2 border-primary/10 bg-background p-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="pt-4 space-y-4 animate-in fade-in duration-500">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Requirements Base</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedRole.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="px-3 py-1 bg-primary/5 text-primary border-none shadow-none font-bold">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-2 underline decoration-primary/30 underline-offset-4">Job Activities & Responsibilities</Label>
                            <p className="text-xs font-medium leading-relaxed italic text-foreground/80 break-words">
                                "{selectedRole.description}"
                            </p>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-6 rounded-3xl bg-secondary/30 border border-secondary shadow-inner space-y-3">
                <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                    <span className="text-sm font-black uppercase tracking-tighter">Enterprise Guard</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                    Our AI models are fine-tuned for bias reduction and professional compliance. All resume data is processed securely and encrypted.
                </p>
            </div>
        </div>

        {/* Step 2: Upload */}
        <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">2</div>
                <div>
                    <h3 className="text-2xl font-bold tracking-tight">Upload candidates</h3>
                    <p className="text-sm text-muted-foreground font-medium">Drag and drop resumes for processing</p>
                </div>
            </div>

            <div className="grid gap-6">
                <div 
                    className={`
                        relative border-4 border-dashed rounded-[40px] p-12 flex flex-col items-center justify-center text-center space-y-6 
                        transition-all duration-500 group overflow-hidden
                        ${files.length > 0 ? "border-primary/20 bg-primary/[0.02]" : "border-muted-foreground/10 hover:border-primary/40 hover:bg-muted/30"}
                    `}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files) {
                            const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf");
                            setFiles(prev => [...prev, ...newFiles]);
                        }
                    }}
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-primary/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity underline-none" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 bg-primary/10 rounded-full blur-3xl opacity-30 group-hover:opacity-80 transition-opacity underline-none" />

                    <div 
                        className="relative z-10 w-24 h-24 rounded-full bg-background border-2 border-primary/20 shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 cursor-pointer"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                    >
                        <Upload className="h-10 w-10 text-primary group-hover:animate-bounce" />
                    </div>
                    
                    <div className="relative z-10 space-y-2">
                        <div className="text-2xl font-black tracking-tight underline-none">Drop resumes here</div>
                        <p className="text-muted-foreground font-medium">PDF formats only, up to 10MB per file</p>
                    </div>

                    <Button 
                        variant="outline" 
                        size="lg" 
                        className="relative z-10 rounded-full px-8 h-12 border-2 text-primary font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                        onClick={() => document.getElementById('resume-upload')?.click()}
                    >
                        Browse Files
                    </Button>

                    <Input 
                        id="resume-upload" 
                        type="file" 
                        multiple 
                        accept=".pdf" 
                        className="hidden" 
                        onChange={handleFileChange}
                    />
                </div>

                {files.length > 0 && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between px-2">
                        <Label className="text-xs uppercase font-black tracking-widest text-muted-foreground">Queue Activity ({files.length})</Label>
                        <Button variant="ghost" size="sm" className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-7" onClick={() => setFiles([])}>Clear All</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-3xl bg-card border border-border text-sm group hover:border-primary/30 hover:shadow-md transition-all duration-300">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <FileText className="h-4 w-4 shrink-0" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold truncate max-w-[150px]">{file.name}</span>
                                <span className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(0)} KB • Ready</span>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-full hover:bg-rose-50 hover:text-rose-500 shrink-0" 
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                            }}
                        >
                            &times;
                        </Button>
                        </div>
                    ))}
                    </div>
                </div>
                )}

                <Button 
                    className="w-full h-16 rounded-[24px] text-xl font-black tracking-wide shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-500 group relative overflow-hidden" 
                    disabled={files.length === 0 || loading} 
                    onClick={handleScreening}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center justify-center gap-3">
                        {loading ? (
                            <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            CALIBRATING NEURAL ENGINE...
                            </>
                        ) : (
                            <>
                            <Zap className="h-6 w-6 text-amber-300 fill-amber-300" />
                            INITIALIZE ANALYSIS
                            </>
                        )}
                    </span>
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
