"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    User, 
    CreditCard, 
    Briefcase,
    Save,
    Plus,
    Trash2,
    X,
    ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<any>({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        bankDetails: {
            bankName: "",
            accountNumber: "",
            ifscCode: "",
            accountHolderName: ""
        },
        skills: []
    });

    const [newSkill, setNewSkill] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/employee/profile");
                const data = await res.json();
                if (data.success) {
                    const p = data.profile;
                    setFormData({
                        firstName: p.firstName || "",
                        lastName: p.lastName || "",
                        phone: p.phone || "",
                        address: p.address || "",
                        bankDetails: {
                            bankName: p.bankDetails?.bankName || "",
                            accountNumber: p.bankDetails?.accountNumber || "",
                            ifscCode: p.bankDetails?.ifscCode || "",
                            accountHolderName: p.bankDetails?.accountHolderName || ""
                        },
                        skills: p.skills || []
                    });
                }
            } catch (error) {
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        if (id.includes('.')) {
            const [parent, child] = id.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData((prev: any) => ({ ...prev, [id]: value }));
        }
    };

    const addSkill = () => {
        if (!newSkill.trim()) return;
        if (formData.skills.includes(newSkill.trim())) return;
        setFormData((prev: any) => ({
            ...prev,
            skills: [...prev.skills, newSkill.trim()]
        }));
        setNewSkill("");
    };

    const removeSkill = (skill: string) => {
        setFormData((prev: any) => ({
            ...prev,
            skills: prev.skills.filter((s: string) => s !== skill)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await fetch("/api/employee/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Profile updated successfully");
                router.push("/employee/profile");
            } else {
                toast.error(data.error || "Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-border/60 pb-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64 rounded-lg" />
                    <Skeleton className="h-4 w-48 rounded opacity-50" />
                </div>
                <Skeleton className="h-9 w-32 rounded-lg" />
            </div>
            <Card className="p-6 space-y-4">
                <Skeleton className="h-6 w-40 rounded opacity-70" />
                <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-10 w-full rounded-lg opacity-40" />
                    <Skeleton className="h-10 w-full rounded-lg opacity-40" />
                </div>
                <Skeleton className="h-24 w-full rounded-xl opacity-40" />
            </Card>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-1 -ml-2 text-muted-foreground hover:text-primary h-7 text-xs font-medium">
                        <Link href="/employee/profile">
                            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Profile
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Profile</h1>
                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">Update your contact information, financial details, and skill inventory.</p>
                </div>
                <Button size="sm" onClick={handleSubmit} disabled={submitting} className="h-8 px-4 text-xs font-medium rounded-lg shadow-xs gap-1.5">
                    <Save className="h-3.5 w-3.5" /> {submitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-2">
                {/* Personal Section */}
                <Card className="rounded-xl border border-border shadow-xs bg-card">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User className="h-4 w-4 text-primary" /> Personal Identity
                        </CardTitle>
                        <CardDescription className="text-xs">Update basic profile identity and contact information.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="firstName" className="text-xs font-medium text-muted-foreground">First Name</Label>
                                <Input id="firstName" value={formData.firstName} onChange={handleChange} className="h-9 text-xs font-medium rounded-lg border-border shadow-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="lastName" className="text-xs font-medium text-muted-foreground">Last Name</Label>
                                <Input id="lastName" value={formData.lastName} onChange={handleChange} className="h-9 text-xs font-medium rounded-lg border-border shadow-xs" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone Number</Label>
                            <Input id="phone" value={formData.phone} onChange={handleChange} className="h-9 text-xs font-medium rounded-lg border-border shadow-xs" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-xs font-medium text-muted-foreground">Residential Address</Label>
                            <Textarea id="address" value={formData.address} onChange={handleChange} className="rounded-lg border-border min-h-[90px] text-xs font-medium resize-none shadow-xs" />
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    {/* Financial Section */}
                    <Card className="rounded-xl border border-border shadow-xs bg-card">
                        <CardHeader className="pb-3 border-b border-border/60">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <CreditCard className="h-4 w-4 text-primary" /> Bank Details
                            </CardTitle>
                            <CardDescription className="text-xs">Manage direct deposit account information.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="bankDetails.bankName" className="text-xs font-medium text-muted-foreground">Bank Name</Label>
                                    <Input id="bankDetails.bankName" value={formData.bankDetails.bankName} onChange={handleChange} placeholder="e.g. HDFC Bank" className="h-9 text-xs font-medium rounded-lg border-border shadow-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="bankDetails.ifscCode" className="text-xs font-medium text-muted-foreground">IFSC / Swift Code</Label>
                                    <Input id="bankDetails.ifscCode" value={formData.bankDetails.ifscCode} onChange={handleChange} className="h-9 text-xs font-medium rounded-lg border-border shadow-xs uppercase" />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="bankDetails.accountNumber" className="text-xs font-medium text-muted-foreground">Account Number</Label>
                                <Input id="bankDetails.accountNumber" value={formData.bankDetails.accountNumber} onChange={handleChange} className="h-9 text-xs font-mono font-medium rounded-lg border-border shadow-xs" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="bankDetails.accountHolderName" className="text-xs font-medium text-muted-foreground">Account Holder Name</Label>
                                <Input id="bankDetails.accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleChange} className="h-9 text-xs font-medium rounded-lg border-border shadow-xs" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Skills Section */}
                    <Card className="rounded-xl border border-border shadow-xs bg-card">
                        <CardHeader className="pb-3 border-b border-border/60">
                            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Briefcase className="h-4 w-4 text-primary" /> Skill Inventory
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="flex gap-2">
                                <Input 
                                    value={newSkill} 
                                    onChange={(e) => setNewSkill(e.target.value)} 
                                    placeholder="Add skill (e.g. React, Node.js)" 
                                    className="h-9 text-xs font-medium rounded-lg border-border shadow-xs" 
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                                />
                                <Button type="button" onClick={addSkill} size="sm" className="h-9 px-3 rounded-lg shadow-xs">
                                    <Plus className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                                {formData.skills.map((skill: string) => (
                                    <Badge key={skill} variant="outline" className="text-xs font-medium bg-muted/60 text-foreground border-border/50 pl-2.5 pr-1 py-0.5 flex items-center gap-1">
                                        {skill}
                                        <button type="button" onClick={() => removeSkill(skill)} className="p-0.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {formData.skills.length === 0 && <p className="text-xs text-muted-foreground font-normal">No skills added yet.</p>}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}
