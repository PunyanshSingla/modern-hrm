"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Check,
  Trash2,
  Save
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { saveScreeningResults } from "@/lib/indexed-db";
import { cn } from "@/lib/utils";

interface Role {
    _id?: string;
    name: string;
    skills: string[];
    description: string;
    isPredefined: boolean;
}

export default function ResumeScreeningPage() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRole, setCustomRole] = useState("");
  const [customSkills, setCustomSkills] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [savingRole, setSavingRole] = useState(false);

  const fetchRoles = async () => {
      try {
          const res = await fetch("/api/admin/screening-roles");
          const data = await res.json();
          if (data.success) {
              setRoles(data.roles);
              if (data.roles.length > 0 && !selectedRole) {
                  setSelectedRole(data.roles[0]);
              }
          }
      } catch (error) {
          console.error("Failed to fetch roles", error);
      }
  };

  useEffect(() => {
      fetchRoles();
  }, []);

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

  const handleDeleteRole = async (e: React.MouseEvent, roleId: string) => {
      e.stopPropagation();
      if (!confirm("Are you sure you want to delete this custom role?")) return;
      
      try {
          const res = await fetch(`/api/admin/screening-roles/${roleId}`, {
              method: "DELETE"
          });
          const data = await res.json();
          if (data.success) {
              toast.success("Role deleted successfully");
              if (selectedRole?._id === roleId) {
                  setSelectedRole(roles[0]);
              }
              setRoles(prev => prev.filter(r => r._id !== roleId));
          } else {
              toast.error(data.error);
          }
      } catch (error) {
          toast.error("Failed to delete role");
      }
  };

  const handleSaveCustomRole = async () => {
      if (!customRole.trim()) {
          toast.error("Role name is required");
          return;
      }
      setSavingRole(true);
      try {
          const res = await fetch("/api/admin/screening-roles", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                  name: customRole,
                  skills: customSkills,
                  description: customDescription
              })
          });
          const data = await res.json();
          if (data.success) {
              toast.success("Role saved and selected!");
              setRoles(prev => [...prev, data.role]);
              setSelectedRole(data.role);
              setIsCustomRole(false);
              setCustomRole("");
              setCustomSkills("");
              setCustomDescription("");
          } else {
              toast.error(data.error);
          }
      } catch (error) {
          toast.error("Failed to save role");
      } finally {
          setSavingRole(false);
      }
  };

  const currentRole = isCustomRole ? customRole : selectedRole?.name || "";
  const currentSkills = isCustomRole ? customSkills : selectedRole?.skills.join(", ") || "";
  const currentDescription = isCustomRole ? customDescription : selectedRole?.description || "";

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

      if (!res.ok) {
        const text = await res.text();
        let errorMessage = "Failed to screen resumes.";
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", text);
        }
        toast.error(errorMessage);
        return;
      }

      const text = await res.text();
      if (!text || text.trim().length === 0) {
        throw new Error("Server returned an empty response.");
      }

      const data = JSON.parse(text);

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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Resume Screening & AI Matcher</h1>
          <p className="text-xs text-muted-foreground mt-1 font-normal">
            Scan candidate resumes against job requirements and identify top matches automatically.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5 items-start">
        {/* Step 1: Role Selection */}
        <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-xl border border-border shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                        <Briefcase className="h-4 w-4 text-primary" /> 1. Select Target Position
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Which position are you screening candidates for?
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                        {roles.map((role) => (
                            <div key={role._id} className="group relative">
                                <Button
                                    variant={!isCustomRole && selectedRole?.name === role.name ? "default" : "outline"}
                                    className={cn(
                                        "w-full justify-start h-9 rounded-lg text-xs font-medium border transition-all",
                                        !isCustomRole && selectedRole?.name === role.name 
                                            ? "bg-primary text-primary-foreground shadow-xs" 
                                            : "hover:border-primary/40",
                                        !role.isPredefined ? "pr-10" : "pr-3"
                                    )}
                                    onClick={() => {
                                        setIsCustomRole(false);
                                        setSelectedRole(role);
                                    }}
                                >
                                    <Briefcase className={cn(
                                        "mr-2 h-3.5 w-3.5 shrink-0",
                                        !isCustomRole && selectedRole?.name === role.name ? "text-primary-foreground" : "text-muted-foreground"
                                    )} />
                                    <span className="truncate font-medium">{role.name}</span>
                                    {!isCustomRole && selectedRole?.name === role.name && (
                                        <Check className="ml-auto h-3.5 w-3.5 shrink-0" />
                                    )}
                                </Button>
                                {!role.isPredefined && (
                                    <button
                                        onClick={(e) => handleDeleteRole(e, role._id!)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-rose-50 hover:text-rose-600 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"
                                        title="Delete Role"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                        <Button
                            variant={isCustomRole ? "default" : "outline"}
                            className={cn(
                                "justify-start h-9 rounded-lg border-dashed text-xs font-medium transition-all",
                                isCustomRole 
                                ? "bg-primary text-primary-foreground shadow-xs" 
                                : "hover:border-primary/40 text-muted-foreground"
                            )}
                            onClick={() => setIsCustomRole(true)}
                        >
                            <Plus className="mr-2 h-3.5 w-3.5" />
                            <span>Create Custom Role</span>
                            {isCustomRole && <Check className="ml-auto h-3.5 w-3.5" />}
                        </Button>
                    </div>

                    {isCustomRole ? (
                        <div className="pt-2 space-y-3 border-t border-border/60">
                            <div>
                                <Label htmlFor="custom-role" className="text-xs font-medium text-muted-foreground mb-1 block">Role Title</Label>
                                <Input
                                    id="custom-role"
                                    placeholder="e.g. Senior Cloud Architect"
                                    value={customRole}
                                    onChange={(e) => setCustomRole(e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                />
                            </div>
                            <div>
                                <Label htmlFor="custom-skills" className="text-xs font-medium text-muted-foreground mb-1 block">Key Skills Required</Label>
                                <Input
                                    id="custom-skills"
                                    placeholder="React, Node.js, AWS"
                                    value={customSkills}
                                    onChange={(e) => setCustomSkills(e.target.value)}
                                    className="h-8 text-xs rounded-lg"
                                />
                            </div>
                            <div>
                                <Label htmlFor="custom-desc" className="text-xs font-medium text-muted-foreground mb-1 block">Role Responsibilities</Label>
                                <textarea
                                    id="custom-desc"
                                    placeholder="Key responsibilities and qualifications..."
                                    value={customDescription}
                                    onChange={(e) => setCustomDescription(e.target.value)}
                                    className="w-full min-h-[80px] rounded-lg border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>
                            <Button
                                onClick={handleSaveCustomRole}
                                disabled={savingRole || !customRole.trim()}
                                size="sm"
                                className="w-full h-8 rounded-lg text-xs font-medium gap-1.5 shadow-xs"
                            >
                                {savingRole ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                Save & Select Role
                            </Button>
                        </div>
                    ) : selectedRole && (
                        <div className="pt-2 space-y-3 border-t border-border/60">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-muted-foreground">Required Skills</Label>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedRole.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary" className="px-2 py-0.5 text-[11px] font-medium bg-muted/60 text-foreground border border-border/50">
                                            {skill}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-1">
                                <Label className="text-[11px] font-medium text-muted-foreground block">Job Description</Label>
                                <p className="text-xs font-normal text-foreground leading-relaxed break-words">
                                    "{selectedRole.description}"
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <div className="p-4 rounded-xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="flex items-center gap-2 text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-semibold text-foreground">Secure Resume Processing</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                    Resumes are evaluated against matching criteria using secure AI screening algorithms.
                </p>
            </div>
        </div>

        {/* Step 2: Upload */}
        <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-xl border border-border shadow-xs">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold tracking-tight flex items-center gap-2 text-foreground">
                        <Upload className="h-4 w-4 text-primary" /> 2. Upload Candidate Resumes
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Drop candidate PDF resumes below to process screening analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                    <div 
                        className={cn(
                            "border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 transition-colors cursor-pointer",
                            files.length > 0 ? "border-primary/30 bg-primary/5" : "border-border hover:border-primary/40 hover:bg-muted/30"
                        )}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files) {
                                const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type === "application/pdf");
                                setFiles(prev => [...prev, ...newFiles]);
                            }
                        }}
                        onClick={() => document.getElementById('resume-upload')?.click()}
                    >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Upload className="h-6 w-6" />
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">Drop PDF resumes here</p>
                            <p className="text-xs text-muted-foreground font-normal">Only PDF files supported</p>
                        </div>

                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-lg h-8 text-xs font-medium mt-1"
                            onClick={(e) => {
                                e.stopPropagation();
                                document.getElementById('resume-upload')?.click();
                            }}
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
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-medium text-muted-foreground">Uploaded Resumes ({files.length})</Label>
                                <Button variant="ghost" size="sm" className="text-xs font-medium text-rose-600 hover:text-rose-700 h-7 px-2" onClick={() => setFiles([])}>Clear All</Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border text-xs">
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                            <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                                                <FileText className="h-3.5 w-3.5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-medium text-foreground truncate">{file.name}</span>
                                                <span className="text-[11px] text-muted-foreground font-normal">{(file.size / 1024).toFixed(0)} KB</span>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-rose-600 shrink-0" 
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

                    <div className="flex items-center justify-between pt-3 border-t border-border/60">
                        <span className="text-xs text-muted-foreground font-normal">
                            {files.length > 0 ? `${files.length} resume${files.length > 1 ? 's' : ''} ready for analysis` : "No resumes selected"}
                        </span>
                        <Button 
                            size="sm"
                            className="h-9 px-4 text-xs font-medium rounded-lg gap-2 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-all" 
                            disabled={files.length === 0 || loading} 
                            onClick={handleScreening}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Analyzing Resumes...
                                </>
                            ) : (
                                <>
                                    <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                                    Start Analysis
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
