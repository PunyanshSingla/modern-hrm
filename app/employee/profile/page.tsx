"use client";

import { format } from "date-fns";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Building,
    Calendar,
    FileText,
    GraduationCap,
    Award,
    CreditCard
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Activity } from "lucide-react";
interface Experience {
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    description?: string;
    technologies?: string[];
}

interface Education {
    institution: string;
    degree: string;
    graduationYear: string;
}

interface Document {
    name: string;
    type: string;
    url: string;
}

interface Certification {
    name: string;
    issuer: string;
    date: string;
    url?: string;
}

interface BankDetails {
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
}

interface EmployeeProfile {
    firstName: string;
    lastName: string;
    userId?: { email: string };
    phone: string;
    address: string;
    position: string;
    departmentId?: { name: string };
    status: string;
    createdAt: string;
    experience: Experience[];
    education: Education[];
    documents: Document[];
    bankDetails: BankDetails;
    skills: string[];
    certifications: Certification[];
}


export default function EmployeeProfilePage() {
    const [profile, setProfile] = useState<EmployeeProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const formatDate = (dateString: string) => {
        if (!dateString) return "N/A";
        try {
            return format(new Date(dateString), "MMM d, yyyy");
        } catch {
            return dateString;
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/employee/profile?t=${Date.now()}`, { cache: 'no-store' });
                const data = await res.json();
                if (data.success) {
                    setProfile(data.profile);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <Card className="rounded-2xl border border-border/60 p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-7 w-48 rounded-lg" />
                            <Skeleton className="h-4 w-36 rounded-md opacity-60" />
                            <Skeleton className="h-4 w-24 rounded-full opacity-50" />
                        </div>
                    </div>
                    <Skeleton className="h-9 w-28 rounded-lg" />
                </div>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6 space-y-4">
                    <Skeleton className="h-6 w-32 rounded opacity-70" />
                    <Skeleton className="h-4 w-full rounded opacity-50" />
                    <Skeleton className="h-4 w-3/4 rounded opacity-50" />
                </Card>
                <Card className="p-6 space-y-4">
                    <Skeleton className="h-6 w-32 rounded opacity-70" />
                    <Skeleton className="h-4 w-full rounded opacity-50" />
                    <Skeleton className="h-4 w-3/4 rounded opacity-50" />
                </Card>
            </div>
        </div>
    );

    if (!profile) return <div className="text-center py-12">Profile not found.</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-card p-6 rounded-xl border border-border shadow-xs relative overflow-hidden">
                <Avatar className="h-20 w-20 border-2 border-border shadow-xs shrink-0">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground font-bold">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-2 flex-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            <p className="text-xs text-muted-foreground font-normal mt-0.5">{profile.position} • {profile.departmentId?.name || "General Department"}</p>
                        </div>
                        <Button variant="outline" size="sm" asChild className="rounded-lg h-8 text-xs font-medium shadow-xs">
                            <Link href="/employee/profile/edit">
                                Edit Profile
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 items-center text-xs pt-1">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/60 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 text-primary" />
                            <span>{profile.userId?.email || "No email"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted/40 border border-border/60 text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 text-primary" />
                            <span>{profile.phone || "No phone"}</span>
                        </div>
                        <Badge variant="outline" className={cn(
                            "text-xs font-medium px-2.5 py-0.5 border capitalize",
                            profile.status === 'active' ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" : "bg-amber-500/10 text-amber-700 border-amber-500/20"
                        )}>
                            {profile.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" /> Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium text-muted-foreground">Email Address</span>
                                    <span className="text-xs font-semibold text-foreground">{profile.userId?.email || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium text-muted-foreground">Phone Number</span>
                                    <span className="text-xs font-semibold text-foreground">{profile.phone || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium text-muted-foreground">Work Location</span>
                                    <span className="text-xs font-semibold text-foreground">{profile.address || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-muted/60 border border-border/60 flex items-center justify-center text-muted-foreground shrink-0">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-medium text-muted-foreground">Joining Date</span>
                                    <span className="text-xs font-semibold text-foreground">{formatDate(profile.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Details */}
                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-primary" /> Bank Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {profile.bankDetails?.accountNumber ? (
                            <div className="p-3.5 rounded-lg bg-muted/30 border border-border/60 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Bank Name</span>
                                    <span className="font-semibold text-foreground">{profile.bankDetails.bankName}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Account Number</span>
                                    <span className="font-mono font-semibold text-foreground">•••• {profile.bankDetails.accountNumber.slice(-4)}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">IFSC Code</span>
                                    <span className="font-semibold text-foreground uppercase">{profile.bankDetails.ifscCode}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted-foreground font-medium">Account Holder</span>
                                    <span className="font-semibold text-foreground">{profile.bankDetails.accountHolderName}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed rounded-lg border-border/60 text-xs text-muted-foreground">
                                No bank details registered.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Experience */}
                <Card className="md:col-span-2 rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-primary" /> Work Experience
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-5">
                        {profile.experience && profile.experience.length > 0 ? (
                            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-border/60">
                                {profile.experience.map((exp, index) => (
                                    <div key={index} className="relative pl-7">
                                        <div className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background shadow-xs z-10" />
                                        <div className="bg-muted/20 p-4 rounded-lg border border-border/60 space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                                <div>
                                                    <h4 className="text-xs font-semibold text-foreground">{exp.role}</h4>
                                                    <p className="text-xs text-primary font-medium">{exp.company}</p>
                                                </div>
                                                <Badge variant="outline" className="text-xs font-medium bg-muted/60 text-muted-foreground border-border/50 w-fit">
                                                    {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "PRESENT"}
                                                </Badge>
                                            </div>
                                            {exp.description && <p className="text-xs text-muted-foreground leading-relaxed">{exp.description}</p>}
                                            {exp.technologies && exp.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1 pt-1">
                                                    {exp.technologies.map((tech, i) => (
                                                        <Badge key={i} variant="outline" className="text-[11px] font-medium bg-muted/60 text-foreground border-border/50">
                                                            {tech}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed rounded-lg border-border/60 text-xs text-muted-foreground">
                                No professional experience listed.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Education */}
                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" /> Education
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {profile.education && profile.education.length > 0 ? (
                            <div className="space-y-3">
                                {profile.education.map((edu, index) => (
                                    <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-0.5">
                                        <h4 className="text-xs font-semibold text-foreground">{edu.institution}</h4>
                                        <p className="text-xs text-primary font-medium">{edu.degree}</p>
                                        <p className="text-[11px] text-muted-foreground">Graduated {edu.graduationYear}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed rounded-lg border-border/60 text-xs text-muted-foreground">
                                No education details provided.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" /> Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {profile.skills && profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                                {profile.skills.map((skill, index) => (
                                    <Badge key={index} variant="outline" className="text-xs font-medium bg-muted/60 text-foreground border-border/50 px-2.5 py-1">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed rounded-lg border-border/60 text-xs text-muted-foreground">
                                No skills added.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Award className="h-4 w-4 text-primary" /> Certifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {profile.certifications && profile.certifications.length > 0 ? (
                            <div className="space-y-3">
                                {profile.certifications.map((cert, index) => (
                                    <div key={index} className="p-3 rounded-lg bg-muted/30 border border-border/60 space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="text-xs font-semibold text-foreground">{cert.name}</h4>
                                                <p className="text-xs text-primary font-medium">{cert.issuer}</p>
                                            </div>
                                            {cert.url && (
                                                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="p-1 rounded bg-muted text-muted-foreground hover:text-foreground">
                                                    <FileText className="h-3.5 w-3.5" />
                                                </a>
                                            )}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground font-normal block">{formatDate(cert.date)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed rounded-lg border-border/60 text-xs text-muted-foreground">
                                No certifications found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card className="md:col-span-2 rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" /> Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {profile.documents && profile.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {profile.documents.map((doc, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/60 hover:border-primary/40 transition-colors">
                                        <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <p className="text-xs font-semibold text-foreground truncate" title={doc.name}>{doc.name}</p>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline mt-0.5">
                                                View Document <Activity className="h-2.5 w-2.5" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed rounded-lg border-border/60 text-xs text-muted-foreground">
                                No documents uploaded.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
