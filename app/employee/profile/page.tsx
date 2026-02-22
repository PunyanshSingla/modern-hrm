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

    if (loading) return <div className="h-48 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    if (!profile) return <div className="text-center py-12">Profile not found.</div>;

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center bg-gradient-to-br from-primary/10 via-background to-background p-8 rounded-[40px] border border-primary/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 bg-primary/5 rounded-full blur-3xl opacity-50" />

                <Avatar className="h-32 w-32 border-4 border-background shadow-2xl relative z-10 scale-100 transition-transform hover:scale-105 duration-500">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-4xl bg-primary text-primary-foreground font-black italic">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-4 flex-1 relative z-10 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary font-bold uppercase tracking-widest text-[10px]">
                                Employee Profile
                            </Badge>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight uppercase leading-none">
                                {profile.firstName} <span className="text-primary italic">{profile.lastName}</span>
                            </h1>
                        </div>
                        <Button variant="outline" size="lg" asChild className="rounded-2xl border-2 font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-md">
                            <Link href="/employee/profile/edit">
                                Edit Profile
                            </Link>
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-4 text-muted-foreground items-center font-medium">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/50 shadow-sm">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <span className="text-sm">{profile.position}</span>
                        </div>
                        {profile.departmentId?.name && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-border/50 shadow-sm">
                                <Building className="h-4 w-4 text-primary" />
                                <span className="text-sm uppercase tracking-tight">{profile.departmentId.name}</span>
                            </div>
                        )}
                        <Badge variant="secondary" className={cn(
                            "font-black uppercase tracking-widest text-[10px] px-4 py-1.5 border-none",
                            profile.status === 'active' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                        )}>
                            {profile.status}
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Personal Information */}
                <Card className="rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden group">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <User className="h-5 w-5" />
                            </div>
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group/item">
                                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Email Address</span>
                                    <span className="font-bold">{profile.userId?.email || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors">
                                    <Phone className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Phone Number</span>
                                    <span className="font-bold">{profile.phone || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col text-sm">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Work Location</span>
                                    <span className="font-bold">{profile.address || "Not provided"}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group/item">
                                <div className="h-10 w-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground group-hover/item:text-primary transition-colors">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Joining Date</span>
                                    <span className="font-bold italic">{formatDate(profile.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Bank Details */}
                <Card className="rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden group">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            Financial Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {profile.bankDetails?.accountNumber ? (
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-muted/50 space-y-3">
                                    <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/50">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Bank Institution</span>
                                        <span className="font-black italic text-primary">{profile.bankDetails.bankName}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/50">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Account Number</span>
                                        <span className="font-black tracking-widest font-mono">•••• {profile.bankDetails.accountNumber.slice(-4)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/50">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">IFSC Routing</span>
                                        <span className="font-bold uppercase tracking-widest">{profile.bankDetails.ifscCode}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/50">
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">Account Holder</span>
                                        <span className="font-bold">{profile.bankDetails.accountHolderName}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-muted-foreground italic">
                                No bank details registered.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Experience */}
                <Card className="md:col-span-2 rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Briefcase className="h-5 w-5" />
                            </div>
                            Professional Journey
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        {profile.experience && profile.experience.length > 0 ? (
                            <div className="space-y-10 relative before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-muted before:opacity-50">
                                {profile.experience.map((exp, index) => (
                                    <div key={index} className="relative pl-10 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="absolute left-0 top-1 h-4 w-4 rounded-full border-2 border-primary bg-background shadow-lg shadow-primary/20 z-10" />
                                        <div className="bg-background/50 p-6 rounded-[32px] border border-border/50 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <h4 className="text-xl font-black uppercase tracking-tight leading-none">{exp.role}</h4>
                                                    <p className="text-primary font-bold italic">{exp.company}</p>
                                                </div>
                                                <Badge variant="outline" className="font-bold rounded-full px-4 py-1.5 border-muted-foreground/10 text-muted-foreground shrink-0 w-fit">
                                                    {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "PRESENT"}
                                                </Badge>
                                            </div>
                                            {exp.description && <p className="text-sm text-foreground/80 leading-relaxed font-medium">"{exp.description}"</p>}
                                            {exp.technologies && exp.technologies.length > 0 && (
                                                <div className="flex flex-wrap gap-1.5 pt-2">
                                                    {exp.technologies.map((tech, i) => (
                                                        <Badge key={i} variant="secondary" className="text-[10px] font-bold uppercase tracking-tighter bg-primary/5 text-primary border-none">
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
                            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-muted-foreground italic">
                                No professional experience listed.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Education */}
                <Card className="rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <GraduationCap className="h-5 w-5" />
                            </div>
                            Academic Background
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {profile.education && profile.education.length > 0 ? (
                            <div className="space-y-4">
                                {profile.education.map((edu, index) => (
                                    <div key={index} className="p-4 rounded-2xl bg-background/50 border border-border/50 shadow-sm space-y-1">
                                        <h4 className="font-black uppercase tracking-tight text-foreground italic leading-tight">{edu.institution}</h4>
                                        <p className="text-sm font-bold text-primary">{edu.degree}</p>
                                        <p className="text-[10px] font-black uppercase text-muted-foreground bg-muted/50 w-fit px-2 py-0.5 rounded-full">Graduated {edu.graduationYear}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-muted-foreground italic">
                                No education details provided.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Skills */}
                <Card className="rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Award className="h-5 w-5" />
                            </div>
                            Skill Palette
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {profile.skills && profile.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.skills.map((skill, index) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1.5 rounded-xl font-bold uppercase tracking-tighter bg-primary text-primary-foreground shadow-sm shadow-primary/20">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-muted-foreground italic text-sm">
                                No skills cataloged.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Certifications */}
                <Card className="rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <Award className="h-5 w-5" />
                            </div>
                            Honors & Credentials
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {profile.certifications && profile.certifications.length > 0 ? (
                            <div className="space-y-4">
                                {profile.certifications.map((cert, index) => (
                                    <div key={index} className="p-4 rounded-2xl bg-background/50 border border-border/50 shadow-sm space-y-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div>
                                                <h4 className="font-black uppercase tracking-tight text-foreground italic leading-tight">{cert.name}</h4>
                                                <p className="text-xs font-bold text-primary">{cert.issuer}</p>
                                            </div>
                                            {cert.url && (
                                                <a href={cert.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                                                    <FileText className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-muted-foreground pt-1">
                                            <span className="bg-muted w-fit px-2 py-0.5 rounded-full italic">{formatDate(cert.date)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed rounded-2xl text-muted-foreground italic text-sm">
                                No certifications verified.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card className="md:col-span-2 rounded-3xl border-muted-foreground/10 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden">
                    <CardHeader className="border-b bg-muted/20 pb-4">
                        <CardTitle className="flex items-center gap-3 text-lg font-bold">
                            <div className="p-2 rounded-xl bg-primary/10 text-primary">
                                <FileText className="h-5 w-5" />
                            </div>
                            Resource Repository
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {profile.documents && profile.documents.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profile.documents.map((doc, index) => (
                                    <div key={index} className="group relative flex items-center gap-4 p-5 rounded-[24px] bg-background/50 border border-border/70 hover:border-primary transition-all duration-300 hover:shadow-lg shadow-sm">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div className="overflow-hidden flex-1">
                                            <p className="font-black text-sm uppercase tracking-tight truncate leading-tight mb-1" title={doc.name}>{doc.name}</p>
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary italic hover:underline">
                                                Access Document <Activity className="h-2 w-2" />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 border-2 border-dashed rounded-[32px] text-muted-foreground animate-pulse">
                                <FileText className="h-10 w-10 mx-auto mb-4 opacity-10" />
                                <p className="font-bold italic">Digital vault is empty.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
